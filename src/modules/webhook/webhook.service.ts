import { Injectable, Logger } from '@nestjs/common'
import type { AsaasWebhookPayload } from '@webhook/webhook.types'
import { BootstrapService } from '@bootstrap/bootstrap.service'
import { SubscriptionRepository } from '@billing/subscription.repository'
import { SubscriptionService } from '@billing/subscription.service'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name)

  constructor(
    private readonly bootstrapService: BootstrapService,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly subscriptionService: SubscriptionService
  ) {}

  /**
   * Routes an incoming Asaas webhook event to the appropriate handler.
   * Returns { processed: true } on success.
   */
  async handleEvent(payload: AsaasWebhookPayload): Promise<{ processed: boolean }> {
    const { event } = payload

    this.logger.log(`Received webhook event: ${event}`)

    switch (event) {
      case 'PAYMENT_CONFIRMED':
      case 'PAYMENT_RECEIVED':
        return this.handlePaymentConfirmed(payload)

      case 'PAYMENT_OVERDUE':
        return this.handlePaymentOverdue(payload)

      case 'PAYMENT_REFUNDED':
        return this.handlePaymentRefunded(payload)

      case 'SUBSCRIPTION_CREATED':
      case 'SUBSCRIPTION_UPDATED':
      case 'SUBSCRIPTION_INACTIVATED':
        this.logger.log(
          `Subscription event ${event}: id=${payload.subscription?.id} — no action needed, state synced on payment events`
        )
        return { processed: true }

      default:
        this.logger.warn(`Unknown webhook event: ${event}`)
        return { processed: true }
    }
  }

  /**
   * Handles PAYMENT_CONFIRMED / PAYMENT_RECEIVED webhook events.
   *
   * Flow:
   * 1. Extract subscription ID from payment.subscription
   * 2. Find TenantRegistration by providerSubscriptionId
   * 3. If PENDING or APPROVED → trigger provisioning via BootstrapService
   * 4. If already PROVISIONED → idempotent skip
   * 5. Return { processed: true }
   */
  private async handlePaymentConfirmed(
    payload: AsaasWebhookPayload
  ): Promise<{ processed: boolean }> {
    const subscriptionId = payload.payment?.subscription

    if (!subscriptionId) {
      this.logger.warn(
        'PAYMENT_CONFIRMED received without subscription ID in payment.subscription'
      )
      return { processed: true }
    }

    this.logger.log(`PAYMENT_CONFIRMED: subscription=${subscriptionId}`)

    // system-level operation — no authenticated user
    const ctx: RequestContext = {
      userId: 'system',
      scope: UserScope.PLATFORM,
      roles: [],
      impersonatedTenantId: null
    }

    return this.bootstrapService.processPaymentConfirmed(subscriptionId, ctx)
  }

  /**
   * Handles PAYMENT_OVERDUE webhook events.
   *
   * Flow:
   * 1. Extract subscription ID from payment.subscription
   * 2. Find local Subscription by providerSubscriptionId
   * 3. Get tenantId from subscription
   * 4. Call SubscriptionService.applyGracePeriod(tenantId, ctx)
   * 5. Log event
   * 6. Return { processed: true }
   */
  private async handlePaymentOverdue(
    payload: AsaasWebhookPayload
  ): Promise<{ processed: boolean }> {
    const subscriptionId = payload.payment?.subscription

    if (!subscriptionId) {
      this.logger.warn(
        'PAYMENT_OVERDUE received without subscription ID in payment.subscription'
      )
      return { processed: true }
    }

    this.logger.log(`PAYMENT_OVERDUE: subscription=${subscriptionId}`)

    // system-level operation — no authenticated user
    const ctx: RequestContext = {
      userId: 'system',
      scope: UserScope.PLATFORM,
      roles: [],
      impersonatedTenantId: null
    }

    // Find local subscription by provider subscription ID
    const subscription = await this.subscriptionRepository.findByProviderSubscriptionId(
      subscriptionId,
      ctx
    )

    if (!subscription) {
      this.logger.warn(
        `PAYMENT_OVERDUE: no local subscription found for provider ID: ${subscriptionId}`
      )
      return { processed: true }
    }

    // Apply grace period
    await this.subscriptionService.applyGracePeriod(
      subscription.tenantId,
      ctx
    )

    this.logger.log(
      `Grace period applied for tenant ${subscription.tenantId} due to PAYMENT_OVERDUE`
    )

    return { processed: true }
  }

  /**
   * Handles PAYMENT_REFUNDED webhook events.
   *
   * Flow:
   * 1. Extract subscription ID from payment.subscription
   * 2. Find local Subscription by providerSubscriptionId
   * 3. Get tenantId from subscription
   * 4. Call SubscriptionService.cancelSubscription(tenantId, cancelAtPeriodEnd=false, ctx)
   * 5. Log event
   * 6. Return { processed: true }
   */
  private async handlePaymentRefunded(
    payload: AsaasWebhookPayload
  ): Promise<{ processed: boolean }> {
    const subscriptionId = payload.payment?.subscription

    if (!subscriptionId) {
      this.logger.warn(
        'PAYMENT_REFUNDED received without subscription ID in payment.subscription'
      )
      return { processed: true }
    }

    this.logger.log(`PAYMENT_REFUNDED: subscription=${subscriptionId}`)

    // system-level operation — no authenticated user
    const ctx: RequestContext = {
      userId: 'system',
      scope: UserScope.PLATFORM,
      roles: [],
      impersonatedTenantId: null
    }

    // Find local subscription by provider subscription ID
    const subscription = await this.subscriptionRepository.findByProviderSubscriptionId(
      subscriptionId,
      ctx
    )

    if (!subscription) {
      this.logger.warn(
        `PAYMENT_REFUNDED: no local subscription found for provider ID: ${subscriptionId}`
      )
      return { processed: true }
    }

    // Cancel subscription immediately (not at period end)
    await this.subscriptionService.cancelSubscription(
      subscription.tenantId,
      false,
      ctx
    )

    this.logger.log(
      `Subscription canceled for tenant ${subscription.tenantId} due to PAYMENT_REFUNDED`
    )

    return { processed: true }
  }
}
