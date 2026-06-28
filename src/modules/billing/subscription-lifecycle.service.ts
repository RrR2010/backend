import { Inject, Injectable, Logger } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { SubscriptionService } from '@billing/subscription.service'
import { SubscriptionRepository } from '@billing/subscription.repository'
import { SubscriptionEventRepository } from '@billing/subscription-event.repository'
import { SubscriptionEvent } from '@billing/subscription-event.entity'
import { TenantRepository } from '@tenants/tenant.repository'
import { AuditLogService } from '@audit-logs/audit-log.service'
import { SubscriptionStatus } from '@shared/enums'
import { SystemState } from '@shared/behaviours/lockable'
import type { Json } from '@shared/types'
import { RequestContext } from '@authorization/authorization.types'
import { SUBSCRIPTION_PROVIDER_TOKEN } from '@billing/billing.constants'
import type { SubscriptionProvider } from '@billing/subscription-provider.interface'
import type { Subscription } from '@billing/subscription.entity'

/**
 * SubscriptionLifecycleService handles lifecycle management operations
 * that go beyond individual subscription mutations:
 *
 * - Task 72: Tenant cleanup/lock when subscription expires
 * - Task 73: Periodic synchronization with the payment provider
 * - Grace period expiry checks across all subscriptions
 *
 * These methods are exempt from the `ctx: RequestContext` requirement
 * when called as system-level scheduled tasks. A platform-scoped context
 * is built internally for repository operations.
 */
@Injectable()
export class SubscriptionLifecycleService {
  private readonly logger = new Logger(SubscriptionLifecycleService.name)

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly subscriptionEventRepository: SubscriptionEventRepository,
    private readonly tenantRepository: TenantRepository,
    private readonly auditLogService: AuditLogService,
    @Inject(SUBSCRIPTION_PROVIDER_TOKEN)
    private readonly provider: SubscriptionProvider
  ) {}

  // ─────────────────────────────────────────────
  // Task 72: Tenant cleanup when subscription expires
  // ─────────────────────────────────────────────

  /**
   * Handles tenant cleanup when a subscription expires.
   *
   * Policy: soft-lock the tenant (SystemState.LOCKED) so that:
   * - The tenant data is preserved for audit and potential reactivation
   * - The tenant cannot be modified or used while locked
   * - An AuditLog event is created for traceability
   *
   * This method is idempotent: if the tenant is already locked, it returns
   * without making changes.
   *
   * @param tenantId - The tenant whose subscription has expired
   * @param ctx - RequestContext for authorization
   * @returns The cleanup result
   */
  async handleTenantCleanup(
    tenantId: string,
    ctx: RequestContext
  ): Promise<{
    tenantId: string
    action: 'locked' | 'already_locked' | 'not_found'
  }> {
    const tenant = await this.tenantRepository.findById(tenantId, ctx)

    if (!tenant) {
      this.logger.warn(`Tenant ${tenantId} not found during cleanup`)
      return { tenantId, action: 'not_found' }
    }

    // Idempotency: already locked or hidden
    if (
      tenant.systemState === SystemState.LOCKED ||
      tenant.systemState === SystemState.DELETED
    ) {
      this.logger.log(
        `Tenant ${tenantId} is already in state ${tenant.systemState}, skipping cleanup`
      )
      return { tenantId, action: 'already_locked' }
    }

    const stateBefore = tenant.systemState

    // Soft-lock the tenant
    tenant.lock()
    const savedTenant = await this.tenantRepository.save(tenant, ctx)

    // Create AuditLog event
    await this.auditLogService.create(
      {
        userId: ctx.userId === 'system' ? null : ctx.userId,
        tenantId,
        entityName: 'Tenant',
        entityId: tenantId,
        ipAddress: null,
        userAgent: null,
        action: 'subscription.expired_tenant_locked',
        before: { systemState: stateBefore },
        after: { systemState: savedTenant.systemState },
        description: null
      },
      ctx
    )

    this.logger.log(
      `Tenant ${tenantId} locked due to subscription expiry (was: ${stateBefore})`
    )

    return { tenantId, action: 'locked' }
  }

  // ─────────────────────────────────────────────
  // Task 73: Periodic synchronization with provider
  // ─────────────────────────────────────────────

  /**
   * Synchronizes all subscriptions with the payment provider.
   *
   * This routine catches any missed webhooks or state drift by:
   * 1. Fetching all subscriptions from the local database in batches
   * 2. Querying the provider for the authoritative state of each
   * 3. Updating local status if it differs from the provider
   * 4. Creating SubscriptionEvent entries for each change
   *
   * Should be run periodically (e.g., daily via cron) to ensure
   * local state matches the provider state.
   *
   * @param ctx - RequestContext (platform-scoped recommended)
   * @returns Summary of sync results
   */
  async syncAllSubscriptionsWithProvider(ctx: RequestContext): Promise<{
    total: number
    synced: number
    unchanged: number
    errors: number
  }> {
    const BATCH_SIZE = 50
    const CONCURRENCY_LIMIT = 5

    let total = 0
    let synced = 0
    let unchanged = 0
    let errors = 0
    let skip = 0
    let hasMore = true

    while (hasMore) {
      const batch = await this.subscriptionRepository.findAll({}, ctx, {
        take: BATCH_SIZE,
        skip
      })

      if (batch.length === 0) {
        hasMore = false
        break
      }

      total += batch.length

      // Process batch with concurrency limit
      const results = await this.processWithConcurrency(
        batch,
        (subscription) => this.syncSingleSubscription(subscription, ctx),
        CONCURRENCY_LIMIT
      )

      for (const result of results) {
        if (result.status === 'fulfilled') {
          if (result.value.synced) {
            synced++
          } else {
            unchanged++
          }
        } else {
          errors++
          const subscription = batch[results.indexOf(result)]
          this.logger.error(
            `Failed to sync subscription ${subscription?.id.value} with provider`,
            {
              error:
                result.reason instanceof Error
                  ? result.reason.message
                  : String(result.reason)
            }
          )
        }
      }

      skip += BATCH_SIZE
    }

    const summary = {
      total,
      synced,
      unchanged,
      errors
    }

    this.logger.log(
      `Provider sync complete: ${summary.total} total, ${summary.synced} synced, ${summary.unchanged} unchanged, ${summary.errors} errors`
    )

    return summary
  }

  /**
   * Processes items with a concurrency limit using Promise.allSettled.
   */
  private async processWithConcurrency<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    concurrency: number
  ): Promise<PromiseSettledResult<R>[]> {
    const allResults: PromiseSettledResult<R>[] = []

    for (let i = 0; i < items.length; i += concurrency) {
      const batch = items.slice(i, i + concurrency)
      const batchResults = await Promise.allSettled(
        batch.map((item) => processor(item))
      )
      allResults.push(...batchResults)
    }

    return allResults
  }

  /**
   * Syncs a single subscription with the provider.
   * Returns { synced: true } if the local state was updated,
   * { synced: false } if no changes were needed.
   */
  private async syncSingleSubscription(
    subscription: Subscription,
    ctx: RequestContext
  ): Promise<{ synced: boolean }> {
    // Fetch authoritative state from provider
    const snapshot = await this.provider.getSubscription(
      subscription.providerSubscriptionId
    )

    const providerStatus = snapshot.status
    const localStatus = subscription.status

    // Note: provider.getSubscription() maps its status to the local SubscriptionStatus enum,
    // so direct comparison is safe.
    // No change needed
    if (providerStatus === localStatus) {
      return { synced: false }
    }

    // Update local status
    const updated = subscription.withStatus(providerStatus)
    await this.subscriptionRepository.save(updated, ctx)

    // Create SubscriptionEvent for the sync
    const event = SubscriptionEvent.create({
      subscriptionId: subscription.id.value,
      providerEventId: `sync-${subscription.id.value}-${randomUUID()}`,
      providerEventType: 'subscription.synced',
      statusBefore: localStatus,
      statusAfter: providerStatus,
      payload: {
        source: 'periodic_sync',
        providerSubscriptionId: subscription.providerSubscriptionId,
        snapshot: {
          status: snapshot.status,
          amount: snapshot.amount,
          paused: snapshot.paused,
          lastError: snapshot.lastError
        }
      } as Json
    })

    await this.subscriptionEventRepository.save(event, ctx)

    this.logger.log(
      `Subscription ${subscription.id.value} synced: ${localStatus} → ${providerStatus}`
    )

    return { synced: true }
  }

  // ─────────────────────────────────────────────
  // Grace period expiry check across all subscriptions
  // ─────────────────────────────────────────────

  /**
   * Checks all subscriptions in GRACE status and expires those whose
   * grace period has ended. Also triggers tenant cleanup for expired
   * subscriptions.
   *
   * Should be run periodically (e.g., hourly) alongside the provider sync.
   *
   * @param ctx - RequestContext (platform-scoped recommended)
   * @returns Summary of expiry check results
   */
  async checkAndExpireGracePeriods(ctx: RequestContext): Promise<{
    total: number
    expired: number
    stillInGrace: number
    tenantsLocked: number
  }> {
    // Find all subscriptions in GRACE status
    const graceSubscriptions = await this.subscriptionRepository.findAll(
      { status: SubscriptionStatus.GRACE },
      ctx
    )

    let expired = 0
    let stillInGrace = 0
    let tenantsLocked = 0

    for (const subscription of graceSubscriptions) {
      // Pass the already-fetched subscription to avoid redundant DB lookup
      const result = await this.subscriptionService.checkGracePeriodExpiry(
        subscription,
        ctx
      )

      if (result && result.isExpired()) {
        expired++

        // Trigger tenant cleanup for expired subscription
        const cleanupResult = await this.handleTenantCleanup(
          subscription.tenantId,
          ctx
        )
        if (cleanupResult.action === 'locked') {
          tenantsLocked++
        }
      } else {
        stillInGrace++
      }
    }

    const summary = {
      total: graceSubscriptions.length,
      expired,
      stillInGrace,
      tenantsLocked
    }

    this.logger.log(
      `Grace period check complete: ${summary.total} total, ${summary.expired} expired, ${summary.stillInGrace} still in grace, ${summary.tenantsLocked} tenants locked`
    )

    return summary
  }
}
