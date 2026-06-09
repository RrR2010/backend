import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Subscription } from '@billing/subscription.entity'
import { SubscriptionEvent } from '@billing/subscription-event.entity'
import { SubscriptionRepository } from '@billing/subscription.repository'
import { SubscriptionEventRepository } from '@billing/subscription-event.repository'
import { PlanService } from '@billing/plan.service'
import { Plan } from '@billing/plan.entity'
import { PriceSnapshot } from '@billing/plan.types'
import type { SubscriptionProvider } from '@billing/subscription-provider.interface'
import type {
  CreateSubscriptionInput as ProviderCreateInput,
  CreateSubscriptionResult,
  UpdateSubscriptionInput as ProviderUpdateInput,
  ProviderSubscriptionSnapshot
} from '@billing/subscription-provider.types'
import {
  ChangePlanInput,
  AddUserInput,
  GRACE_PERIOD_DAYS,
  DEFAULT_BILLING_CYCLE_DAYS
} from '@billing/subscription.types'
import {
  SubscriptionNotFoundError,
  SubscriptionNotModifiableError,
  SubscriptionCannotPauseError,
  SubscriptionCannotResumeError,
  SubscriptionCannotCancelError,
  SubscriptionCancelConflictError,
  AdditionalUsersNotAllowedError,
  InvalidPlanTransitionError,
  PlanNotPublicError,
  ResourceLimitExceededError
} from '@billing/billing.errors'
import { SubscriptionStatus, PlanType } from '@shared/enums'
import type { Json } from '@shared/types'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { SUBSCRIPTION_PROVIDER_TOKEN } from '@billing/billing.constants'
import { PrismaService } from '@shared/prisma/prisma.service'
import { SystemState } from '@shared/behaviours/lockable'

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name)

  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly subscriptionEventRepository: SubscriptionEventRepository,
    private readonly planService: PlanService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    @Inject(SUBSCRIPTION_PROVIDER_TOKEN)
    private readonly provider: SubscriptionProvider
  ) {}

  // ─────────────────────────────────────────────
  // Bootstrap onboarding: create subscription in provider only
  // ─────────────────────────────────────────────

  /**
   * Creates a subscription in the payment provider and calculates the price,
   * but does NOT persist the subscription locally. Used during bootstrap
   * onboarding where the tenant does not exist yet.
   *
   * The caller is responsible for:
   * 1. Storing the provider subscription ID in the registration record
   * 2. Creating the local Subscription entity after tenant provisioning
   *
   * Returns the provider result and calculated price snapshot.
   */
  async createSubscriptionForOnboarding(
    planType: PlanType,
    payerEmail: string,
    payerName: string,
    reason: string,
    externalRef: string,
    backUrlSuccess: string,
    backUrlFailure: string,
    providerCustomerId: string | null
  ): Promise<{
    providerResult: CreateSubscriptionResult
    priceSnapshot: PriceSnapshot
    plan: Plan
  }> {
    // TODO: zod validate input

    // Use platform context since no authenticated user exists during onboarding
    const platformCtx: RequestContext = {
      userId: 'system',
      scope: UserScope.PLATFORM,
      roles: [],
      impersonatedTenantId: null
    }

    // Get plan and calculate price (backend is source of truth for pricing)
    const plan = await this.planService.getByType(planType, platformCtx)
    const priceSnapshot = this.planService.applyPriceSnapshot(plan, 0)

    // Build provider input — tenantId is temporary placeholder since tenant
    // doesn't exist yet. Provider only needs payer info and amount.
    const providerInput: ProviderCreateInput = {
      tenantId: 'pending-provisioning',
      planType,
      amount: priceSnapshot.totalPrice,
      currency: 'BRL',
      payerEmail,
      payerName,
      reason,
      externalRef,
      backUrlSuccess,
      backUrlFailure,
      providerCustomerId: providerCustomerId ?? null
    }

    // Create subscription in provider
    const providerResult = await this.provider.createSubscription(providerInput)

    this.logger.log(
      `Onboarding subscription created in provider: ${providerResult.providerSubscriptionId}, plan: ${planType}, amount: ${priceSnapshot.totalPrice}`
    )

    return { providerResult, priceSnapshot, plan }
  }

  /**
   * Finalizes an onboarding subscription by creating the local Subscription
   * entity after the tenant has been provisioned. Links the provider
   * subscription to the newly created tenant.
   */
  async finalizeOnboardingSubscription(
    tenantId: string,
    providerSubscriptionId: string,
    planType: PlanType,
    ctx: RequestContext,
    providerCustomerId: string | null = null
  ): Promise<Subscription> {
    // TODO: zod validate input

    // Check if subscription already exists for this tenant
    const existing = await this.subscriptionRepository.findByTenantId(
      tenantId,
      ctx
    )
    if (existing) {
      this.logger.log(
        `Subscription already exists for tenant ${tenantId} during onboarding finalization, returning existing`
      )
      return existing
    }

    // Get plan for price snapshot
    const plan = await this.planService.getByType(planType, ctx)
    const priceSnapshot = this.planService.applyPriceSnapshot(plan, 0)

    // Build domain subscription from provider data
    // Status is set to ACTIVE because the webhook has confirmed the preapproval
    // was authorized by the provider. The subscription is no longer in trial —
    // the payment authorization has been verified.
    const now = new Date()
    const subscription = Subscription.create({
      tenantId,
      planType,
      status: SubscriptionStatus.ACTIVE,
      currency: 'BRL',
      provider: this.provider.name,
      providerSubscriptionId,
      providerCustomerId,
      basePriceSnapshot: priceSnapshot.basePrice,
      additionalUserPriceSnapshot: priceSnapshot.additionalUserPrice,
      includedUsersSnapshot: priceSnapshot.includedUsers,
      additionalUsers: 0,
      currentAmount: priceSnapshot.totalPrice,
      nextBillingAmount: priceSnapshot.totalPrice,
      currentPeriodStart: now,
      currentPeriodEnd: new Date(
        now.getTime() + DEFAULT_BILLING_CYCLE_DAYS * 24 * 60 * 60 * 1000
      ),
      graceEndsAt: null,
      cancelAtPeriodEnd: false,
      pendingPlanType: null,
      pendingEffectiveFrom: null,
      pendingNewAmount: null,
      failedPaymentCount: 0,
      lastPaymentAt: null,
      lastWebhookAt: null
    })

    const saved = await this.subscriptionRepository.save(subscription, ctx)

    // Create onboarding event
    await this.createEvent(
      saved.id.value,
      'subscription.onboarding_completed',
      null,
      saved.status,
      {
        planType: saved.planType,
        amount: saved.currentAmount,
        providerSubscriptionId: saved.providerSubscriptionId,
        source: 'onboarding'
      },
      ctx
    )

    this.logger.log(
      `Onboarding subscription finalized for tenant ${tenantId}: ${saved.id.value}`
    )
    return saved
  }

  // ─────────────────────────────────────────────
  // Task 31: Get current subscription
  // ─────────────────────────────────────────────

  /**
   * Returns the current subscription for a tenant, or null if none exists.
   */
  async getCurrentSubscription(
    tenantId: string,
    ctx: RequestContext
  ): Promise<Subscription | null> {
    return this.subscriptionRepository.findByTenantId(tenantId, ctx)
  }

  // ─────────────────────────────────────────────
  // Task 32: Pause subscription
  // ─────────────────────────────────────────────

  /**
   * Pauses an active subscription.
   * Idempotent: returns subscription if already paused.
   */
  async pauseSubscription(
    tenantId: string,
    ctx: RequestContext
  ): Promise<Subscription> {
    const subscription = await this.getSubscriptionOrThrow(tenantId, ctx)

    // Idempotency: already paused
    if (subscription.isPaused()) {
      this.logger.log(`Subscription ${subscription.id.value} is already paused`)
      return subscription
    }

    // Validate can pause
    if (!subscription.canPause()) {
      throw new SubscriptionCannotPauseError(subscription.id.value)
    }

    // Call provider to pause
    await this.provider.pauseSubscription(subscription.providerSubscriptionId)

    // Update local status
    const updated = subscription.withStatus(SubscriptionStatus.PAUSED)
    const saved = await this.subscriptionRepository.save(updated, ctx)

    // Create event
    await this.createEvent(
      saved.id.value,
      'subscription.paused',
      subscription.status,
      saved.status,
      {
        providerSubscriptionId: saved.providerSubscriptionId
      },
      ctx
    )

    this.logger.log(`Subscription ${saved.id.value} paused`)
    return saved
  }

  // ─────────────────────────────────────────────
  // Task 33: Resume subscription
  // ─────────────────────────────────────────────

  /**
   * Resumes a paused subscription.
   * Idempotent: returns subscription if already active.
   */
  async resumeSubscription(
    tenantId: string,
    ctx: RequestContext
  ): Promise<Subscription> {
    const subscription = await this.getSubscriptionOrThrow(tenantId, ctx)

    // Idempotency: already active
    if (subscription.isActive()) {
      this.logger.log(`Subscription ${subscription.id.value} is already active`)
      return subscription
    }

    // Validate can resume
    if (!subscription.canResume()) {
      throw new SubscriptionCannotResumeError(subscription.id.value)
    }

    // Call provider to resume
    await this.provider.resumeSubscription(subscription.providerSubscriptionId)

    // Update local status
    const updated = subscription.withStatus(SubscriptionStatus.ACTIVE)
    const saved = await this.subscriptionRepository.save(updated, ctx)

    // Create event
    await this.createEvent(
      saved.id.value,
      'subscription.resumed',
      subscription.status,
      saved.status,
      {
        providerSubscriptionId: saved.providerSubscriptionId
      },
      ctx
    )

    this.logger.log(`Subscription ${saved.id.value} resumed`)
    return saved
  }

  // ─────────────────────────────────────────────
  // Task 34: Cancel subscription
  // ─────────────────────────────────────────────

  /**
   * Cancels a subscription.
   * If cancelAtPeriodEnd is true, keeps ACTIVE until period end.
   * If false, cancels immediately.
   * Idempotent: returns subscription if already canceled.
   */
  async cancelSubscription(
    tenantId: string,
    cancelAtPeriodEnd: boolean,
    ctx: RequestContext
  ): Promise<Subscription> {
    const subscription = await this.getSubscriptionOrThrow(tenantId, ctx)

    // Idempotency: already canceled
    if (subscription.isCanceled()) {
      this.logger.log(
        `Subscription ${subscription.id.value} is already canceled`
      )
      return subscription
    }

    // Fix 4: If already set to cancel at period end, reject immediate cancel
    if (subscription.cancelAtPeriodEnd && !cancelAtPeriodEnd) {
      throw new SubscriptionCancelConflictError(subscription.id.value)
    }

    // Validate can cancel
    if (!subscription.canCancel()) {
      throw new SubscriptionCannotCancelError(subscription.id.value)
    }

    // Call provider to cancel
    await this.provider.cancelSubscription(
      subscription.providerSubscriptionId,
      cancelAtPeriodEnd
    )

    let updated: Subscription

    if (cancelAtPeriodEnd) {
      // Keep active but mark for cancellation at period end
      updated = subscription.withCancelAtPeriodEnd(true)
    } else {
      // Cancel immediately
      updated = subscription.withStatus(SubscriptionStatus.CANCELED)
    }

    const saved = await this.subscriptionRepository.save(updated, ctx)

    // Create event
    await this.createEvent(
      saved.id.value,
      cancelAtPeriodEnd
        ? 'subscription.cancel_at_period_end'
        : 'subscription.canceled',
      subscription.status,
      saved.status,
      {
        providerSubscriptionId: saved.providerSubscriptionId,
        cancelAtPeriodEnd: saved.cancelAtPeriodEnd
      },
      ctx,
      cancelAtPeriodEnd ? 'SCHEDULED' : 'COMPLETED'
    )

    this.logger.log(
      `Subscription ${saved.id.value} canceled (atPeriodEnd: ${cancelAtPeriodEnd})`
    )
    return saved
  }

  // ─────────────────────────────────────────────
  // Task 35: Change plan
  // ─────────────────────────────────────────────

  /**
   * Changes the subscription plan.
   *
   * Flow:
   * 1. FREE → PAID: Creates a provider subscription (onboarding flow), returns payment URL.
   *    The actual plan change happens when the webhook confirms payment authorization.
   * 2. PAID → PAID: Stores the change as pending. The change takes effect at the next
   *    billing cycle (currentPeriodEnd). No proration — full new price at cycle start.
   * 3. FREE → PAID branch: Since the tenant has no provider subscription, we create one
   *    via createSubscriptionForOnboarding and redirect the user to payment.
   */
  async changePlan(
    input: ChangePlanInput,
    ctx: RequestContext
  ): Promise<{
    subscription: Subscription
    oldPlanType: PlanType
    currentAmount: number
    paymentUrl?: string
  }> {
    // TODO: zod validate input

    const subscription = await this.getSubscriptionOrThrow(input.tenantId, ctx)

    // Validate subscription is modifiable
    if (!subscription.canBeModified()) {
      throw new SubscriptionNotModifiableError(
        subscription.id.value,
        subscription.status
      )
    }

    // Validate not in grace period
    if (subscription.isInGracePeriod()) {
      throw new SubscriptionNotModifiableError(
        subscription.id.value,
        subscription.status
      )
    }

    // Validate plan transition
    if (subscription.planType === input.newPlanType) {
      // If there's a pending change, this is a revert — clear it
      if (subscription.pendingPlanType) {
        this.logger.log(
          `Clearing pending plan change for subscription ${subscription.id.value}`
        )
        const oldPlanType = subscription.planType
        const reverted = subscription.clearPendingPlanChange()
        const saved = await this.subscriptionRepository.save(reverted, ctx)

        await this.createEvent(
          saved.id.value,
          'subscription.pending_plan_change_reverted',
          saved.status,
          saved.status,
          {
            providerSubscriptionId: saved.providerSubscriptionId,
            oldPendingPlanType: subscription.pendingPlanType,
            oldAmount: subscription.currentAmount,
            effectiveFrom:
              subscription.pendingEffectiveFrom?.toISOString() ?? null
          },
          ctx,
          'CANCELED'
        )

        return {
          subscription: saved,
          oldPlanType,
          currentAmount: saved.currentAmount
        }
      }
      this.logger.log(
        `Subscription ${subscription.id.value} already on plan ${input.newPlanType}`
      )
      return {
        subscription,
        oldPlanType: subscription.planType,
        currentAmount: subscription.currentAmount
      }
    }

    // Get new plan
    const newPlan = await this.planService.getByType(input.newPlanType, ctx)

    // Validate transition rules
    this.validatePlanTransition(
      subscription.planType,
      input.newPlanType,
      newPlan
    )

    // Calculate new price (keeping existing additional users)
    const newAmount = newPlan.calculatePrice(subscription.additionalUsers)

    // ── Branch 1: FREE → PAID — Create provider subscription (onboarding flow)
    if (subscription.planType === PlanType.FREE) {
      // Validate downgrade limits (if any)
      this.validateDowngradeLimits(subscription, newPlan)

      // TODO(EP-001, Wave 4+): When upgrading FREE → PAID with Asaas, the
      // subscription has no providerCustomerId because no Asaas customer was
      // created during FREE registration (T-012 only runs for paid plans).
      // This path needs to create an Asaas customer first, then use that ID
      // when calling createSubscriptionForOnboarding.
      if (
        this.provider.name === 'asaas' &&
        subscription.providerCustomerId === null
      ) {
        throw new Error(
          'FREE → PAID upgrade with Asaas requires customer creation first, which is not yet implemented. ' +
            'See TODO(EP-001, Wave 4+).'
        )
      }

      // Create provider subscription via onboarding flow
      // The tenant already exists, so we create the subscription directly
      const frontendUrl = this.configService.get<string>(
        'FRONTEND_URL',
        'http://localhost:3000'
      )

      const onboardingResult = await this.createSubscriptionForOnboarding(
        input.newPlanType,
        'payer@email.com', // Placeholder — ideally from tenant identity
        'Payer',
        `Plano ${input.newPlanType}`,
        subscription.id.value,
        `${frontendUrl}/bootstrap/success`,
        `${frontendUrl}/bootstrap/failure`,
        null
      )

      // Update subscription: switch from synthetic free-{id} to real provider ID,
      // and store the pending plan change
      const effectiveFrom = subscription.currentPeriodEnd ?? new Date()
      const updated = subscription
        .withProviderSubscriptionId(
          onboardingResult.providerResult.providerSubscriptionId
        )
        .withPendingPlanChange(input.newPlanType, effectiveFrom, newAmount)
      const saved = await this.subscriptionRepository.save(updated, ctx)

      await this.createEvent(
        saved.id.value,
        'subscription.pending_plan_change',
        subscription.status,
        saved.status,
        {
          providerSubscriptionId: saved.providerSubscriptionId,
          oldPlanType: subscription.planType,
          newPlanType: input.newPlanType,
          oldAmount: subscription.currentAmount,
          newAmount,
          effectiveFrom: effectiveFrom.toISOString(),
          paymentUrl: onboardingResult.providerResult.paymentUrl ?? undefined
        },
        ctx,
        'SCHEDULED'
      )

      this.logger.log(
        `FREE → ${input.newPlanType} pending plan change for subscription ${saved.id.value}`
      )

      const response: {
        subscription: Subscription
        oldPlanType: PlanType
        currentAmount: number
        paymentUrl?: string
      } = {
        subscription: saved,
        oldPlanType: subscription.planType,
        currentAmount: subscription.currentAmount
      }
      if (onboardingResult.providerResult.paymentUrl) {
        response.paymentUrl = onboardingResult.providerResult.paymentUrl
      }
      return response
    }

    // ── Branch 2: PAID → PAID — Store as pending, apply at cycle end
    // Validate downgrade limits
    this.validateDowngradeLimits(subscription, newPlan)

    const effectiveFrom = subscription.currentPeriodEnd ?? new Date()
    const updated = subscription.withPendingPlanChange(
      input.newPlanType,
      effectiveFrom,
      newAmount
    )
    const saved = await this.subscriptionRepository.save(updated, ctx)

    // Create event
    await this.createEvent(
      saved.id.value,
      'subscription.pending_plan_change',
      subscription.status,
      saved.status,
      {
        providerSubscriptionId: saved.providerSubscriptionId,
        oldPlanType: subscription.planType,
        newPlanType: input.newPlanType,
        oldAmount: subscription.currentAmount,
        newAmount,
        effectiveFrom: effectiveFrom.toISOString()
      },
      ctx,
      'SCHEDULED'
    )

    this.logger.log(
      `${subscription.planType} → ${input.newPlanType} pending plan change for subscription ${saved.id.value}`
    )

    this.logger.log(
      `Pending plan change stored for subscription ${saved.id.value}: ${subscription.planType} → ${input.newPlanType}, effective ${effectiveFrom.toISOString()}`
    )

    return {
      subscription: saved,
      oldPlanType: subscription.planType,
      currentAmount: subscription.currentAmount
    }
  }

  // ─────────────────────────────────────────────
  // Task 36: Add user and recalculate
  // ─────────────────────────────────────────────

  /**
   * Adds a user to the subscription and recalculates the monthly amount.
   * Validates if the plan allows additional users.
   */
  async addUserAndRecalculate(
    input: AddUserInput,
    ctx: RequestContext
  ): Promise<Subscription> {
    // TODO: zod validate input

    const subscription = await this.getSubscriptionOrThrow(input.tenantId, ctx)

    // Validate subscription is modifiable
    if (!subscription.canBeModified()) {
      throw new SubscriptionNotModifiableError(
        subscription.id.value,
        subscription.status
      )
    }

    // Get plan to check if additional users are allowed
    const plan = await this.planService.getByType(subscription.planType, ctx)

    // Fix 5: Secondary guard using snapshot — if the subscription was created
    // with an additional user price, the plan allowed additional users at that
    // time. This protects against plan definition changes after subscription.
    if (
      !plan.allowsAdditionalUsers &&
      subscription.additionalUserPriceSnapshot === null
    ) {
      throw new AdditionalUsersNotAllowedError(plan.type)
    }

    // Increment additional users
    const newAdditionalUsers = subscription.additionalUsers + 1

    // Recalculate amount
    const newAmount = plan.calculatePrice(newAdditionalUsers)

    // Update provider with new amount
    const providerUpdateInput: ProviderUpdateInput = {
      providerSubscriptionId: subscription.providerSubscriptionId,
      amount: newAmount,
      currency: 'BRL',
      reason: `Additional user added (total: ${newAdditionalUsers})`
    }
    await this.provider.updateSubscription(providerUpdateInput)

    // Update local subscription
    const updated = subscription.withAdditionalUsers(
      newAdditionalUsers,
      newAmount
    )
    const saved = await this.subscriptionRepository.save(updated, ctx)

    // Create event
    await this.createEvent(
      saved.id.value,
      'subscription.user_added',
      subscription.status,
      saved.status,
      {
        providerSubscriptionId: saved.providerSubscriptionId,
        userId: input.userId,
        additionalUsersBefore: subscription.additionalUsers,
        additionalUsersAfter: saved.additionalUsers,
        oldAmount: subscription.currentAmount,
        newAmount: saved.currentAmount
      },
      ctx
    )

    this.logger.log(
      `User added to subscription ${saved.id.value}, new amount: ${newAmount}`
    )
    return saved
  }

  // ─────────────────────────────────────────────
  // Task 39: Grace period policy
  // ─────────────────────────────────────────────

  /**
   * Applies grace period after a payment failure.
   * Sets status to GRACE and graceEndsAt to now + GRACE_PERIOD_DAYS.
   */
  async applyGracePeriod(
    tenantId: string,
    ctx: RequestContext
  ): Promise<Subscription> {
    const subscription = await this.getSubscriptionOrThrow(tenantId, ctx)

    // Idempotency: already in grace period
    if (subscription.isInGracePeriod()) {
      this.logger.log(
        `Subscription ${subscription.id.value} is already in grace period`
      )
      return subscription
    }

    const graceEndsAt = new Date()
    graceEndsAt.setDate(graceEndsAt.getDate() + GRACE_PERIOD_DAYS)

    const updated = subscription.withGracePeriod(graceEndsAt)
    const saved = await this.subscriptionRepository.save(updated, ctx)

    // Create event
    await this.createEvent(
      saved.id.value,
      'subscription.grace_period_started',
      subscription.status,
      saved.status,
      {
        providerSubscriptionId: saved.providerSubscriptionId,
        graceEndsAt: saved.graceEndsAt,
        gracePeriodDays: GRACE_PERIOD_DAYS,
        failedPaymentCount: saved.failedPaymentCount
      },
      ctx
    )

    this.logger.log(
      `Grace period applied to subscription ${saved.id.value}, ends at ${graceEndsAt.toISOString()}`
    )
    return saved
  }

  /**
   * Checks if grace period has expired and marks subscription as EXPIRED.
   * Returns the updated subscription or null if not in grace period.
   */
  async checkGracePeriodExpiry(
    tenantId: string,
    ctx: RequestContext
  ): Promise<Subscription | null>

  /**
   * Checks if grace period has expired and marks subscription as EXPIRED.
   * Accepts a Subscription directly to avoid redundant DB lookup.
   * Returns the updated subscription or null if not in grace period.
   */
  async checkGracePeriodExpiry(
    subscription: Subscription,
    ctx: RequestContext
  ): Promise<Subscription | null>

  async checkGracePeriodExpiry(
    tenantOrSubscription: string | Subscription,
    ctx: RequestContext
  ): Promise<Subscription | null> {
    let subscription: Subscription | null

    if (typeof tenantOrSubscription === 'string') {
      subscription = await this.subscriptionRepository.findByTenantId(
        tenantOrSubscription,
        ctx
      )
    } else {
      subscription = tenantOrSubscription
    }

    if (!subscription) {
      return null
    }

    return this.processGracePeriodExpiry(subscription, ctx)
  }

  /**
   * Core logic for checking and processing grace period expiry.
   */
  private async processGracePeriodExpiry(
    subscription: Subscription,
    ctx: RequestContext
  ): Promise<Subscription | null> {
    // Not in grace period, nothing to do
    if (!subscription.isInGracePeriod()) {
      return null
    }

    // Grace period not yet expired
    if (
      subscription.graceEndsAt !== null &&
      subscription.graceEndsAt > new Date()
    ) {
      return subscription
    }

    // Grace period expired
    const updated = subscription.withStatus(SubscriptionStatus.EXPIRED)
    const saved = await this.subscriptionRepository.save(updated, ctx)

    // Create event
    await this.createEvent(
      saved.id.value,
      'subscription.expired',
      subscription.status,
      saved.status,
      {
        providerSubscriptionId: saved.providerSubscriptionId,
        graceEndsAt: subscription.graceEndsAt,
        expiredAt: new Date().toISOString()
      },
      ctx
    )

    this.logger.log(`Subscription ${saved.id.value} expired after grace period`)
    return saved
  }

  /**
   * Handles a payment failure by transitioning the subscription directly
   * to GRACE period. No failure threshold check — single overdue → GRACE.
   */
  async handlePaymentFailure(
    tenantId: string,
    ctx: RequestContext
  ): Promise<Subscription> {
    const subscription = await this.getSubscriptionOrThrow(tenantId, ctx)

    // Idempotency: already in grace period
    if (subscription.isInGracePeriod()) {
      this.logger.log(
        `Subscription ${subscription.id.value} is already in grace period`
      )
      return subscription
    }

    const graceEndsAt = new Date()
    graceEndsAt.setDate(graceEndsAt.getDate() + GRACE_PERIOD_DAYS)

    const updated = subscription.withGracePeriod(graceEndsAt)
    const saved = await this.subscriptionRepository.save(updated, ctx)

    // Create event
    await this.createEvent(
      saved.id.value,
      'payment_failed',
      subscription.status,
      saved.status,
      {
        providerSubscriptionId: saved.providerSubscriptionId,
        graceEndsAt: saved.graceEndsAt,
        gracePeriodDays: GRACE_PERIOD_DAYS
      },
      ctx
    )

    this.logger.log(
      `Payment failure: grace period applied to subscription ${saved.id.value}, ends at ${graceEndsAt.toISOString()}`
    )
    return saved
  }

  /**
   * Handles a successful payment by resetting failure counter.
   * Only sets status to ACTIVE if currently GRACE;
   * preserves PAUSED status otherwise.
   */
  async handlePaymentSuccess(
    tenantId: string,
    ctx: RequestContext
  ): Promise<Subscription> {
    const subscription = await this.getSubscriptionOrThrow(tenantId, ctx)

    const now = new Date()

    // Only set status to ACTIVE if GRACE; preserve PAUSED (or other) status otherwise
    const targetStatus = subscription.isInGracePeriod()
      ? SubscriptionStatus.ACTIVE
      : subscription.status

    const updated = subscription.withPaymentSuccess(now, targetStatus)
    const saved = await this.subscriptionRepository.save(updated, ctx)

    // Create event
    await this.createEvent(
      saved.id.value,
      'subscription.payment_succeeded',
      subscription.status,
      saved.status,
      {
        providerSubscriptionId: saved.providerSubscriptionId,
        failedPaymentCount: saved.failedPaymentCount
      },
      ctx
    )

    this.logger.log(`Payment succeeded for subscription ${saved.id.value}`)
    return saved
  }

  // ─────────────────────────────────────────────
  // Phase 7: Webhook processing and synchronization
  // ─────────────────────────────────────────────

  /**
   * Processes a webhook notification from the payment provider.
   *
   * NOTE: This method is exempt from the `ctx: RequestContext` requirement
   * because it is a provider-facing webhook endpoint — there is no authenticated
   * user context. A system-level RequestContext is built internally for
   * repository operations.
   *
   * Flow:
   * 1. Validate webhook signature (returns { processed: false } on invalid — HTTP 200)
   * 2. Filter out non-subscription topics early
   * 3. Extract provider event ID and subscription ID from payload
   * 4. Deduplicate by providerEventId (idempotent — returns 200 if already processed)
   * 5. Fetch authoritative state from provider (never trust payload alone)
   * 6. Map provider status to local SubscriptionStatus
   * 7. Update subscription state (status, period timestamps, failure counters)
   * 8. Persist SubscriptionEvent
   * 9. Return 200 only after all processing is complete
   */
  async processWebhook(
    body: Record<string, unknown>,
    headers: Record<string, string>,
    topic: string
  ): Promise<{ processed: boolean; providerSubscriptionId?: string }> {
    // TODO: zod validate input

    // Step 1: Validate webhook signature.
    // Per EPIC_007: respond 200 whenever the request is authenticated and
    // processable. Invalid signatures return { processed: false } with HTTP 200
    // to avoid infinite retry loops from the provider.
    const isValid = this.provider.validateWebhookSignature(headers, body)
    if (!isValid) {
      this.logger.warn('Webhook signature validation failed — returning 200')
      return { processed: false }
    }

    // Step 2: Filter out non-subscription topics early.
    // Mercado Pago may send test pings or events unrelated to subscriptions.
    if (topic === 'ping' || topic === 'test' || topic === 'unknown') {
      this.logger.log(`Ignoring non-subscription webhook topic: ${topic}`)
      return { processed: false }
    }

    // Step 3: Extract provider subscription ID from payload.
    // Mercado Pago preapproval webhooks include the preapproval ID in data.id.
    const dataObj = body['data'] as Record<string, unknown> | undefined
    const providerSubscriptionId =
      typeof dataObj?.['id'] === 'string'
        ? dataObj['id']
        : typeof body['id'] === 'string'
          ? body['id']
          : null

    if (!providerSubscriptionId) {
      this.logger.warn('Webhook received without provider subscription ID', {
        topic,
        bodyKeys: Object.keys(body)
      })
      return { processed: false }
    }

    // Step 4: Extract provider event ID for deduplication.
    // Use the actual provider event ID if available (e.g., notification ID),
    // otherwise generate a synthetic one.
    const notificationId =
      typeof body['notification_id'] === 'string'
        ? body['notification_id']
        : typeof body['resource'] === 'string'
          ? body['resource']
          : null

    const providerEventId = notificationId
      ? `evt-${topic}-${notificationId}`
      : null

    // Build platform context for webhook processing (system-level operation)
    const ctx: RequestContext = {
      userId: 'system',
      scope: UserScope.PLATFORM,
      roles: [],
      impersonatedTenantId: null
    }

    // Step 5: Deduplicate by providerEventId.
    if (providerEventId !== null) {
      const existingEvent =
        await this.subscriptionEventRepository.findByProviderEventId(
          providerEventId,
          ctx
        )
      if (existingEvent) {
        this.logger.log(
          `Duplicate webhook detected (providerEventId: ${providerEventId}), skipping`
        )
        return { processed: false }
      }
    }

    // Step 6: Fetch authoritative state from provider.
    let snapshot: Awaited<ReturnType<typeof this.provider.getSubscription>>
    try {
      snapshot = await this.provider.getSubscription(providerSubscriptionId)
    } catch (error) {
      this.logger.error(
        `Failed to fetch subscription from provider: ${providerSubscriptionId}`,
        {
          error: error instanceof Error ? error.message : String(error)
        }
      )
      // Return { processed: false } — provider will retry; event will be
      // reconciled on the next successful fetch.
      return { processed: false }
    }

    // Step 7: Find local subscription.
    const subscription =
      await this.subscriptionRepository.findByProviderSubscriptionId(
        providerSubscriptionId,
        ctx
      )

    if (!subscription) {
      if (topic === 'subscription_preapproval') {
        this.logger.log(
          `No local subscription found for onboarding preapproval: ${providerSubscriptionId}`
        )
        return { processed: false, providerSubscriptionId }
      }
      this.logger.warn(
        `No local subscription found for provider ID: ${providerSubscriptionId}`
      )
      return { processed: false }
    }

    // Fallback deduplication: if no providerEventId was available, check the
    // latest event for this subscription to avoid processing duplicates.
    if (providerEventId === null) {
      const latestEvent =
        await this.subscriptionEventRepository.findLatestBySubscriptionId(
          subscription.id.value,
          ctx
        )
      if (latestEvent) {
        const timeDiff = Date.now() - latestEvent.createdAt.getTime()
        if (
          latestEvent.providerEventType === topic &&
          latestEvent.statusAfter === snapshot.status &&
          timeDiff < 60_000
        ) {
          this.logger.log(
            `Duplicate webhook detected for subscription ${subscription.id.value} (fallback check), topic: ${topic}`
          )
          return { processed: false }
        }
      }
    }

    const now = new Date()

    // NEW: Handle subscription_authorized_payment events (individual charge notifications)
    if (topic === 'subscription_authorized_payment') {
      return this.handleAuthorizedPayment(
        subscription,
        body,
        snapshot,
        providerEventId,
        providerSubscriptionId,
        now,
        ctx
      )
    }

    // Step 8: Map provider status to local status.
    const newStatus = snapshot.status
    const statusBefore = subscription.status

    // Step 9: Update subscription state based on event type.
    let updated: Subscription = subscription

    // Update period timestamps from provider snapshot.
    if (snapshot.currentPeriodStart || snapshot.currentPeriodEnd) {
      const periodStart =
        snapshot.currentPeriodStart ?? subscription.currentPeriodStart
      const periodEnd =
        snapshot.currentPeriodEnd ?? subscription.currentPeriodEnd

      if (periodStart && periodEnd) {
        updated = updated.withPeriodUpdate(periodStart, periodEnd)
      }
    }

    // Handle specific event types.
    const isPaymentFailure =
      topic.includes('payment') && snapshot.lastError !== null

    const isPaymentSuccess =
      topic.includes('payment') &&
      newStatus === SubscriptionStatus.ACTIVE &&
      subscription.isInGracePeriod()

    const isCancellation =
      newStatus === SubscriptionStatus.CANCELED &&
      statusBefore !== SubscriptionStatus.CANCELED

    const isResumption =
      newStatus === SubscriptionStatus.ACTIVE && subscription.isPaused()

    if (isPaymentFailure) {
      if (!subscription.isInGracePeriod() && !subscription.isCanceled()) {
        const graceEndsAt = new Date()
        graceEndsAt.setDate(graceEndsAt.getDate() + GRACE_PERIOD_DAYS)
        updated = updated.withGracePeriod(graceEndsAt)
      }
    } else if (isPaymentSuccess) {
      updated = updated.withPaymentSuccess(now, newStatus)
    } else if (isCancellation) {
      updated = updated.withStatus(SubscriptionStatus.CANCELED)
    } else if (isResumption) {
      updated = updated.withStatus(SubscriptionStatus.ACTIVE)
    } else {
      // Generic status update from provider snapshot.
      if (newStatus !== statusBefore) {
        updated = updated.withStatus(newStatus)
      }
    }

    // Update lastWebhookAt timestamp.
    updated = Subscription.rehydrate({
      ...updated,
      lastWebhookAt: now,
      updatedAt: new Date()
    })

    // Step 10: Persist updated subscription.
    const saved = await this.subscriptionRepository.save(updated, ctx)

    // Step 11: Create SubscriptionEvent with raw payload.
    const eventPayload: Json = {
      topic,
      providerSubscriptionId,
      rawBody: body as Json,
      snapshot: {
        status: snapshot.status,
        amount: snapshot.amount,
        currentPeriodStart: snapshot.currentPeriodStart?.toISOString() ?? null,
        currentPeriodEnd: snapshot.currentPeriodEnd?.toISOString() ?? null,
        cancelAtPeriodEnd: snapshot.cancelAtPeriodEnd,
        paused: snapshot.paused,
        lastError: snapshot.lastError
      }
    }

    const event = SubscriptionEvent.create({
      subscriptionId: saved.id.value,
      providerEventId: providerEventId ?? null,
      providerEventType: topic,
      statusBefore: statusBefore,
      statusAfter: saved.status,
      payload: eventPayload
    })

    await this.subscriptionEventRepository.save(event, ctx)

    this.logger.log(
      `Webhook processed for subscription ${saved.id.value}: ${topic}, status: ${statusBefore} → ${saved.status}`
    )

    return { processed: true }
  }

  /**
   * Handles subscription_authorized_payment webhook events from Mercado Pago.
   * These are notifications about individual charges within a subscription.
   */
  private async handleAuthorizedPayment(
    subscription: Subscription,
    body: Record<string, unknown>,
    snapshot: ProviderSubscriptionSnapshot,
    providerEventId: string | null,
    providerSubscriptionId: string,
    now: Date,
    ctx: RequestContext
  ): Promise<{ processed: boolean; providerSubscriptionId?: string }> {
    // Extract payment status from body or snapshot
    // MP sends these with data.id = payment ID
    const paymentId =
      typeof (body['data'] as Record<string, unknown>)?.['id'] === 'string'
        ? ((body['data'] as Record<string, unknown>)['id'] as string)
        : null

    // Determine if payment was approved or rejected
    // According to MP docs, subscription_authorized_payment events have action like
    // "payment.created" or status info in the body
    const action = typeof body['action'] === 'string' ? body['action'] : null

    let wasPaymentSuccess = false
    let wasPaymentFailure = false

    // Primary: use action from payload
    if (action === 'payment.created') {
      wasPaymentSuccess = true
    } else if (action === 'payment.refunded' || action === 'payment.rejected') {
      wasPaymentFailure = true
    } else if (snapshot.lastError !== null) {
      // Secondary: provider reported an error for this charge
      wasPaymentFailure = true
    } else {
      // Fallback: use snapshot status as a heuristic
      if (snapshot.status === SubscriptionStatus.ACTIVE) {
        wasPaymentSuccess = true
      }
    }

    let updated: Subscription = subscription

    if (wasPaymentSuccess) {
      updated = updated.withPaymentSuccess(now, snapshot.status)
      this.logger.log(
        `Authorized payment success for subscription ${subscription.id.value}` +
          (paymentId ? ` (payment: ${paymentId})` : '')
      )
    } else if (wasPaymentFailure) {
      if (!subscription.isInGracePeriod() && !subscription.isCanceled()) {
        const graceEndsAt = new Date()
        graceEndsAt.setDate(graceEndsAt.getDate() + GRACE_PERIOD_DAYS)
        updated = updated.withGracePeriod(graceEndsAt)
      }
      this.logger.log(
        `Authorized payment failure for subscription ${subscription.id.value}` +
          (paymentId ? ` (payment: ${paymentId})` : '')
      )
    }

    // Update lastWebhookAt timestamp
    updated = Subscription.rehydrate({
      ...updated,
      lastWebhookAt: now,
      updatedAt: new Date()
    })

    // Persist
    const saved = await this.subscriptionRepository.save(updated, ctx)

    // Create SubscriptionEvent
    const eventPayload: Record<string, unknown> = {
      topic: 'subscription_authorized_payment',
      providerSubscriptionId,
      paymentId,
      action,
      snapshot: {
        status: snapshot.status,
        amount: snapshot.amount,
        lastError: snapshot.lastError
      }
    }

    const event = SubscriptionEvent.create({
      subscriptionId: saved.id.value,
      providerEventId: providerEventId ?? null,
      providerEventType: 'subscription_authorized_payment',
      statusBefore: subscription.status,
      statusAfter: saved.status,
      payload: eventPayload as any // Json type
    })

    await this.subscriptionEventRepository.save(event, ctx)

    this.logger.log(
      `Authorized payment webhook processed for subscription ${saved.id.value}: ` +
        `status: ${subscription.status} → ${saved.status}`
    )

    return { processed: true }
  }

  // ─────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────

  // ─────────────────────────────────────────────
  // Phase 11: Usage counts for subscription dashboard
  // ─────────────────────────────────────────────

  /**
   * Returns usage counts (products, active users, revisions) for a tenant.
   */
  async getUsageCounts(
    tenantId: string,
    ctx: RequestContext
  ): Promise<{
    currentProducts: number
    currentActiveUsers: number
    currentRevisions: number
  }> {
    const [currentProducts, currentActiveUsers] = await Promise.all([
      this.prisma.product.count({
        where: {
          tenantId,
          systemState: 'ACTIVE'
        }
      }),
      this.prisma.tenantMembership.count({
        where: {
          tenantId,
          systemState: 'ACTIVE'
        }
      })
    ])

    // Revision counts are optional — count them if the model exists
    let currentRevisions = 0
    try {
      currentRevisions = await this.prisma.formulationRevision.count({
        where: {
          formulationVersion: {
            tenantId
          }
        }
      })
    } catch {
      // Revision tracking not available, default to 0
    }

    return { currentProducts, currentActiveUsers, currentRevisions }
  }

  // ─────────────────────────────────────────────
  // Lifecycle: Apply pending plan changes
  // ─────────────────────────────────────────────

  /**
   * Applies a pending plan change for a single subscription.
   * Idempotent: returns as-is if no pending change exists.
   */
  async applyPendingPlanChange(
    tenantId: string,
    ctx: RequestContext
  ): Promise<Subscription> {
    const subscription = await this.getSubscriptionOrThrow(tenantId, ctx)

    if (!subscription.pendingPlanType) {
      this.logger.log(
        `No pending plan change for subscription ${subscription.id.value}`
      )
      return subscription
    }

    // Get the target plan to apply the correct price snapshot
    const targetPlan = await this.planService.getByType(
      subscription.pendingPlanType,
      ctx
    )
    const priceSnapshot = this.planService.applyPriceSnapshot(
      targetPlan,
      subscription.additionalUsers
    )

    // Update provider with new amount (only if not a FREE plan)
    if (subscription.provider !== 'free') {
      try {
        await this.provider.updateSubscription({
          providerSubscriptionId: subscription.providerSubscriptionId,
          amount: subscription.pendingNewAmount ?? subscription.currentAmount,
          currency: 'BRL',
          reason: `Pending plan change applied: ${subscription.planType} → ${subscription.pendingPlanType}`
        })
      } catch (error) {
        this.logger.error(
          `Failed to update provider for pending plan change on subscription ${subscription.id.value}`,
          { error: error instanceof Error ? error.message : String(error) }
        )
        // Don't block — the provider can be updated later via sync
      }
    }

    // Apply pending change and update pricing snapshot
    const applied = subscription
      .applyPendingPlanChange()
      .withPlanChange(
        subscription.pendingPlanType,
        priceSnapshot.basePrice,
        priceSnapshot.includedUsers,
        priceSnapshot.additionalUserPrice,
        subscription.pendingNewAmount ?? subscription.currentAmount
      )

    // Recalculate amount with existing additional users
    const finalSubscription = applied.withAdditionalUsers(
      subscription.additionalUsers,
      subscription.pendingNewAmount ?? subscription.currentAmount
    )

    const saved = await this.subscriptionRepository.save(finalSubscription, ctx)

    // Create event
    await this.createEvent(
      saved.id.value,
      'subscription.plan_change_applied',
      subscription.status,
      saved.status,
      {
        providerSubscriptionId: saved.providerSubscriptionId,
        oldPlanType: subscription.planType,
        newPlanType: saved.planType,
        oldAmount: subscription.currentAmount,
        newAmount: saved.currentAmount,
        effectiveFrom: subscription.pendingEffectiveFrom?.toISOString() ?? null
      },
      ctx
    )

    this.logger.log(
      `Pending plan change applied for subscription ${saved.id.value}: ${subscription.planType} → ${saved.planType}`
    )

    return saved
  }

  /**
   * Applies all pending plan changes that are due (currentPeriodEnd <= now).
   * Used by the lifecycle cron endpoint.
   */
  async applyAllDuePendingChanges(
    ctx: RequestContext
  ): Promise<{ total: number; applied: number; errors: number }> {
    // Find all subscriptions with pendingPlanType not null
    const allSubscriptions = await this.subscriptionRepository.findAll({}, ctx)

    const dueSubscriptions = allSubscriptions.filter(
      (sub) =>
        sub.pendingPlanType !== null &&
        sub.pendingEffectiveFrom !== null &&
        sub.pendingEffectiveFrom <= new Date()
    )

    let applied = 0
    let errors = 0

    for (const sub of dueSubscriptions) {
      try {
        await this.applyPendingPlanChange(sub.tenantId, ctx)
        applied++
      } catch (error) {
        this.logger.error(
          `Failed to apply pending plan change for subscription ${sub.id.value}`,
          { error: error instanceof Error ? error.message : String(error) }
        )
        errors++
      }
    }

    this.logger.log(
      `Pending plan changes: ${dueSubscriptions.length} due, ${applied} applied, ${errors} errors`
    )

    return {
      total: dueSubscriptions.length,
      applied,
      errors
    }
  }

  // ─────────────────────────────────────────────
  // Task 81: Get subscription events with pagination
  // ─────────────────────────────────────────────

  /**
   * Returns paginated subscription events for a tenant's subscription.
   */
  async getEvents(
    tenantId: string,
    pagination: { page: number; limit: number },
    ctx: RequestContext
  ): Promise<{
    events: SubscriptionEvent[]
    total: number
    page: number
    limit: number
  }> {
    const subscription = await this.getSubscriptionOrThrow(tenantId, ctx)
    const filter = { subscriptionId: subscription.id.value }

    const skip = (pagination.page - 1) * pagination.limit
    const [events, total] = await Promise.all([
      this.subscriptionEventRepository.findAll(filter, ctx, {
        skip,
        take: pagination.limit
      }),
      this.subscriptionEventRepository.countByFilter(filter, ctx)
    ])

    return {
      events,
      total,
      page: pagination.page,
      limit: pagination.limit
    }
  }

  private async getSubscriptionOrThrow(
    tenantId: string,
    ctx: RequestContext
  ): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findByTenantId(
      tenantId,
      ctx
    )
    if (!subscription) {
      // Passing undefined as subscriptionId triggers the tenant-based
      // error message in SubscriptionNotFoundError ("Subscription not found
      // for tenant: {tenantId}") instead of the ID-based message.
      throw new SubscriptionNotFoundError(undefined, tenantId)
    }
    return subscription
  }

  private validatePlanTransition(
    fromPlan: PlanType,
    toPlan: PlanType,
    targetPlan: Plan
  ): void {
    // FREE cannot be changed directly to ENTERPRISE (requires sales process)
    if (fromPlan === PlanType.FREE && toPlan === PlanType.ENTERPRISE) {
      throw new InvalidPlanTransitionError(
        fromPlan,
        toPlan,
        'Enterprise plans require a sales process'
      )
    }

    // Target plan must be active
    if (!targetPlan.isActive) {
      throw new InvalidPlanTransitionError(
        fromPlan,
        toPlan,
        'Target plan is not active'
      )
    }

    // Fix 9: Target plan must be public
    if (!targetPlan.isPublic) {
      throw new PlanNotPublicError(toPlan)
    }
  }

  private validateDowngradeLimits(
    subscription: Subscription,
    targetPlan: Plan
  ): void {
    // If user count exceeds the new plan's included users
    const totalUsers = subscription.getTotalUsers()
    if (totalUsers > targetPlan.includedUsers) {
      throw new ResourceLimitExceededError(
        'users',
        totalUsers,
        targetPlan.includedUsers
      )
    }

    // If the plan has maxProducts and the current count might exceed it
    // Note: actual product count would need additional repo calls - this is a
    // basic validation. A more thorough check can be added when the product
    // module is integrated with subscription limits.
    if (targetPlan.maxProducts !== null) {
      // Basic validation: warn if maxProducts is restrictive
      this.logger.log(
        `Downgrade validation: target plan maxProducts=${targetPlan.maxProducts}`
      )
    }
  }

  private async createEvent(
    subscriptionId: string,
    eventType: string,
    statusBefore: SubscriptionStatus | null,
    statusAfter: SubscriptionStatus | null,
    payload: Record<string, unknown>,
    ctx: RequestContext,
    actionStatus: string = 'COMPLETED'
  ): Promise<SubscriptionEvent> {
    const event = SubscriptionEvent.create({
      subscriptionId,
      providerEventId: null,
      providerEventType: eventType,
      statusBefore: statusBefore ?? null,
      statusAfter: statusAfter ?? null,
      payload: payload as Json,
      actionStatus
    })

    return this.subscriptionEventRepository.save(event, ctx)
  }
}
