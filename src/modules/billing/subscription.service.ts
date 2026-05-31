import { Inject, Injectable, Logger } from '@nestjs/common'
import { Prisma } from '@prisma/client'
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
  UpdateSubscriptionInput as ProviderUpdateInput
} from '@billing/subscription-provider.types'
import {
  CreateSubscriptionInput,
  ChangePlanInput,
  AddUserInput,
  GRACE_PERIOD_DAYS,
  GRACE_PERIOD_FAILURE_THRESHOLD,
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
  PlanNotPublicError
} from '@billing/billing.errors'
import { SubscriptionStatus, PlanType } from '@shared/enums'
import type { Json } from '@shared/types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { SUBSCRIPTION_PROVIDER_TOKEN } from '@billing/billing.constants'

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name)

  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly subscriptionEventRepository: SubscriptionEventRepository,
    private readonly planService: PlanService,
    @Inject(SUBSCRIPTION_PROVIDER_TOKEN)
    private readonly provider: SubscriptionProvider
  ) {}

  // ─────────────────────────────────────────────
  // Task 30: Create subscription
  // ─────────────────────────────────────────────

  /**
   * Creates a new subscription for a tenant.
   * Idempotent: returns existing subscription if one already exists.
   *
   * Atomic idempotency: tenantId has a unique constraint in the database.
   * If a concurrent request creates a subscription for the same tenant,
   * the P2002 unique constraint error is caught and the existing record
   * is returned, ensuring consistency even under race conditions.
   *
   * Returns the subscription and the provider checkout URL (paymentUrl).
   */
  // ⛔ DEAD CODE PATH (2026-05-20 decision): This method is only called by the
  // dead POST /subscriptions/checkout endpoint which is marked for deletion.
  // After the checkout endpoint is removed, this method should be reviewed:
  //   - If no other caller exists, delete it
  //   - If needed for existing tenant upgrades, protect with auth and validate
  //     tenant ownership (derive tenantId from ctx, not from input)
  //
  // Current issues:
  //   - Creates subscriptions with tenantId='checkout-pending' when called from
  //     the dead checkout endpoint (orphaned subscriptions)
  //   - Includes trialEndsAt logic which is being removed (see TODO below)
  //
  // See docs/USER-STORIES.md §2C for the confirmed decision.
  async createSubscription(
    input: CreateSubscriptionInput,
    ctx: RequestContext
  ): Promise<{ subscription: Subscription; paymentUrl: string | null }> {
    // TODO: zod validate input

    // Fix 7: Derive tenantId from ctx for tenant-scoped users (authoritative
    // source). Platform-scoped users may create subscriptions for any tenant,
    // so input.tenantId is used in that case.
    const tenantId =
      ctx.scope === UserScope.TENANT
        ? ctx.tenantId
        : (input.tenantId ?? getEffectiveTenantId(ctx))

    // Idempotency: check if subscription already exists
    const existing = await this.subscriptionRepository.findByTenantId(
      tenantId,
      ctx
    )
    if (existing) {
      this.logger.log(
        `Subscription already exists for tenant ${tenantId}, returning existing`
      )
      return { subscription: existing, paymentUrl: null }
    }

    // Get plan and calculate price
    const plan = await this.planService.getByType(input.planType, ctx)
    const priceSnapshot = this.planService.applyPriceSnapshot(plan, 0)

    // Build provider input
    const providerInput: ProviderCreateInput = {
      tenantId,
      planType: input.planType,
      amount: priceSnapshot.totalPrice,
      currency: 'BRL',
      payerEmail: input.payerEmail,
      payerName: input.payerName,
      backUrlSuccess: input.backUrlSuccess,
      backUrlPending: input.backUrlPending,
      backUrlFailure: input.backUrlFailure,
      webhookUrl: input.webhookUrl,
      trialDays: plan.trialDays
    }

    // Create subscription in provider
    const providerResult: CreateSubscriptionResult =
      await this.provider.createSubscription(providerInput)

    // Build domain subscription
    const now = new Date()
    const subscription = Subscription.create({
      tenantId,
      planType: input.planType,
      status: providerResult.status,
      currency: 'BRL',
      provider: this.provider.name,
      providerSubscriptionId: providerResult.providerSubscriptionId,
      providerPreapprovalId: providerResult.providerPreapprovalId,
      providerCustomerId: providerResult.providerCustomerId,
      basePriceSnapshot: priceSnapshot.basePrice,
      additionalUserPriceSnapshot: priceSnapshot.additionalUserPrice,
      includedUsersSnapshot: priceSnapshot.includedUsers,
      additionalUsers: 0,
      currentAmount: priceSnapshot.totalPrice,
      nextBillingAmount: priceSnapshot.totalPrice,
      // TODO (2026-05-20 decision): Trial feature is being REMOVED.
      // Basic plan serves as the entry-level paid tier — no trial period needed.
      // Delete this trialEndsAt logic and remove trialDays from Plan entity/seed.
      // Set to null permanently, then remove the field from Subscription entity.
      trialEndsAt: null,
      // OLD TRIAL LOGIC (to be deleted):
      // trialEndsAt:
      //   plan.trialDays !== null && plan.trialDays > 0
      //     ? new Date(now.getTime() + plan.trialDays * 24 * 60 * 60 * 1000)
      //     : null,
      currentPeriodStart: now,
      // Fix 10: Set currentPeriodEnd based on default billing cycle
      // when provider does not return a specific period end date
      currentPeriodEnd: new Date(
        now.getTime() + DEFAULT_BILLING_CYCLE_DAYS * 24 * 60 * 60 * 1000
      ),
      graceEndsAt: null,
      cancelAtPeriodEnd: false,
      failedPaymentCount: 0,
      lastPaymentAt: null,
      lastWebhookAt: null
    })

    // Persist locally — if a concurrent request created a subscription for
    // the same tenantId, the unique constraint will trigger P2002.
    let saved: Subscription
    try {
      saved = await this.subscriptionRepository.save(subscription, ctx)
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        // Unique constraint violated on tenantId — fetch and return existing
        const concurrent = await this.subscriptionRepository.findByTenantId(
          tenantId,
          ctx
        )
        if (concurrent) {
          this.logger.log(
            `Concurrent subscription creation detected for tenant ${tenantId}, returning existing`
          )
          return { subscription: concurrent, paymentUrl: null }
        }
      }
      throw error
    }

    // Create event
    await this.createEvent(
      saved.id.value,
      'subscription.created',
      null,
      saved.status,
      {
        planType: saved.planType,
        amount: saved.currentAmount,
        providerSubscriptionId: saved.providerSubscriptionId,
        trialEndsAt: saved.trialEndsAt
      },
      ctx
    )

    this.logger.log(
      `Subscription created for tenant ${tenantId}: ${saved.id.value}`
    )
    return { subscription: saved, paymentUrl: providerResult.paymentUrl }
  }

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
    backUrlSuccess: string,
    backUrlPending: string,
    backUrlFailure: string,
    webhookUrl: string
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
      backUrlSuccess,
      backUrlPending,
      backUrlFailure,
      webhookUrl,
      // TODO (2026-05-20 decision): Trial feature is being REMOVED.
      // Set to 0 or null, then remove from ProviderCreateInput interface.
      trialDays: 0
      // OLD: trialDays: plan.trialDays
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
    ctx: RequestContext
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
      providerPreapprovalId: null,
      providerCustomerId: null,
      basePriceSnapshot: priceSnapshot.basePrice,
      additionalUserPriceSnapshot: priceSnapshot.additionalUserPrice,
      includedUsersSnapshot: priceSnapshot.includedUsers,
      additionalUsers: 0,
      currentAmount: priceSnapshot.totalPrice,
      nextBillingAmount: priceSnapshot.totalPrice,
      // TODO (2026-05-20 decision): Trial feature is being REMOVED.
      // Set to null permanently, then remove the field from Subscription entity.
      trialEndsAt: null,
      // OLD TRIAL LOGIC (to be deleted):
      // trialEndsAt:
      //   plan.trialDays !== null && plan.trialDays > 0
      //     ? new Date(now.getTime() + plan.trialDays * 24 * 60 * 60 * 1000)
      //     : null,
      currentPeriodStart: now,
      currentPeriodEnd: new Date(
        now.getTime() + DEFAULT_BILLING_CYCLE_DAYS * 24 * 60 * 60 * 1000
      ),
      graceEndsAt: null,
      cancelAtPeriodEnd: false,
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
        trialEndsAt: saved.trialEndsAt,
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

    // Idempotency: already active or trialing
    if (subscription.isActive() || subscription.isTrialing()) {
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
      ctx
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
   * TODO (2026-05-20 decisions): This method needs significant refactoring:
   *
   * 1. END-OF-CYCLE CHANGES (not immediate):
   *    - Instead of applying the change immediately, store it as pending:
   *      subscription.pendingPlanType = newPlanType
   *      subscription.pendingEffectiveFrom = currentPeriodEnd
   *      subscription.pendingNewAmount = newAmount
   *    - Return the pending change details to the user for confirmation
   *
   * 2. NO PRORATION:
   *    - Remove any proration logic (currently none exists, which is correct)
   *    - The change takes effect at the next billing cycle with full new price
   *
   * 3. FREE → PAID BRANCH:
   *    - If subscription.planType === FREE, the tenant has no provider subscription
   *    - Branch: call createSubscriptionForOnboarding() → redirect to payment
   *    - Webhook will finalize the subscription after payment authorization
   *
   * 4. VALIDATION ADDITIONS:
   *    - Add grace period check: throw if subscription.isInGracePeriod()
   *    - Add downgrade limit checks:
   *      * User count ≤ new plan's includedUsers
   *      * Product count ≤ new plan's maxProducts
   *      * Revision count ≤ new plan's maxRevisions
   *    - Remove FREE → ENTERPRISE block (user can jump tiers if limits met)
   *
   * 5. APPLY PENDING CHANGES:
   *    - Add applyPendingPlanChange() method called by:
   *      a) Webhook handler (primary) — when payment succeeds at cycle end
   *      b) Cron job (fallback) — /lifecycle/apply-pending-changes
   *    - This method: updates provider via PUT /preapproval/{id},
   *      syncs local state, clears pending fields, creates event
   *
   * See docs/USER-STORIES.md §4C for the confirmed flow diagram.
   */
  async changePlan(
    input: ChangePlanInput,
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

    // Validate plan transition
    if (subscription.planType === input.newPlanType) {
      this.logger.log(
        `Subscription ${subscription.id.value} already on plan ${input.newPlanType}`
      )
      return subscription
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
    const newPriceSnapshot = this.planService.applyPriceSnapshot(
      newPlan,
      subscription.additionalUsers
    )

    // Update provider with new amount
    const providerUpdateInput: ProviderUpdateInput = {
      providerSubscriptionId: subscription.providerSubscriptionId,
      amount: newAmount,
      currency: 'BRL',
      reason: `Plan change from ${subscription.planType} to ${input.newPlanType}`
    }
    await this.provider.updateSubscription(providerUpdateInput)

    // Update local subscription
    const updated = subscription.withPlanChange(
      input.newPlanType,
      newPriceSnapshot.basePrice,
      newPriceSnapshot.includedUsers,
      newPriceSnapshot.additionalUserPrice,
      newAmount // Fix 6: update nextBillingAmount to match recalculated amount
    )

    // Recalculate current amount with additional users
    const finalSubscription = updated.withAdditionalUsers(
      subscription.additionalUsers,
      newAmount
    )

    const saved = await this.subscriptionRepository.save(finalSubscription, ctx)

    // Create event
    await this.createEvent(
      saved.id.value,
      'subscription.plan_changed',
      subscription.status,
      saved.status,
      {
        providerSubscriptionId: saved.providerSubscriptionId,
        oldPlanType: subscription.planType,
        newPlanType: saved.planType,
        oldAmount: subscription.currentAmount,
        newAmount: saved.currentAmount
      },
      ctx
    )

    this.logger.log(
      `Subscription ${saved.id.value} plan changed from ${subscription.planType} to ${saved.planType}`
    )
    return saved
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
   * Handles a payment failure by incrementing the failure counter.
   * If failures reach the threshold, enters grace period in a single DB write
   * (avoids the double-save that occurred when calling applyGracePeriod separately).
   */
  async handlePaymentFailure(
    tenantId: string,
    ctx: RequestContext
  ): Promise<Subscription> {
    const subscription = await this.getSubscriptionOrThrow(tenantId, ctx)

    const newFailureCount = subscription.failedPaymentCount + 1

    // Fix 3: Enter grace period only after reaching the failure threshold
    // (not on the first failure). This gives the payment provider time to
    // retry and avoids premature grace period activation.
    if (
      newFailureCount >= GRACE_PERIOD_FAILURE_THRESHOLD &&
      !subscription.isInGracePeriod() &&
      !subscription.isCanceled()
    ) {
      // Fix 2: Combine failure recording and grace period into a single
      // state transition to ensure only one DB write per logical operation.
      const graceEndsAt = new Date()
      graceEndsAt.setDate(graceEndsAt.getDate() + GRACE_PERIOD_DAYS)

      const updated = subscription.withGracePeriodAfterFailure(
        newFailureCount,
        graceEndsAt
      )
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
        `Grace period applied to subscription ${saved.id.value} after ${newFailureCount} failures, ends at ${graceEndsAt.toISOString()}`
      )
      return saved
    }

    // Below threshold — just record the failure
    const updated = subscription.withPaymentFailure(newFailureCount)
    const saved = await this.subscriptionRepository.save(updated, ctx)

    // Create event
    await this.createEvent(
      saved.id.value,
      'subscription.payment_failed',
      subscription.status,
      saved.status,
      {
        providerSubscriptionId: saved.providerSubscriptionId,
        failedPaymentCount: saved.failedPaymentCount
      },
      ctx
    )

    this.logger.log(
      `Payment failure recorded for subscription ${saved.id.value}, count: ${newFailureCount}`
    )
    return saved
  }

  /**
   * Handles a successful payment by resetting failure counter.
   * Only sets status to ACTIVE if currently PAST_DUE or GRACE;
   * preserves PAUSED status otherwise.
   */
  async handlePaymentSuccess(
    tenantId: string,
    ctx: RequestContext
  ): Promise<Subscription> {
    const subscription = await this.getSubscriptionOrThrow(tenantId, ctx)

    const now = new Date()

    // Fix 8: Only set status to ACTIVE if PAST_DUE or GRACE;
    // preserve PAUSED (or other) status otherwise
    const targetStatus =
      subscription.isPastDue() || subscription.isInGracePeriod()
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
        lastPaymentAt: saved.lastPaymentAt,
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
  ): Promise<{ processed: boolean }> {
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

    // Step 8: Map provider status to local status.
    const newStatus = snapshot.status
    const statusBefore = subscription.status

    // Step 9: Update subscription state based on event type.
    let updated: Subscription = subscription
    const now = new Date()

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
      topic.includes('payment') &&
      (snapshot.lastError !== null || newStatus === SubscriptionStatus.PAST_DUE)

    const isPaymentSuccess =
      topic.includes('payment') &&
      newStatus === SubscriptionStatus.ACTIVE &&
      (subscription.isPastDue() || subscription.isInGracePeriod())

    const isCancellation =
      newStatus === SubscriptionStatus.CANCELED &&
      statusBefore !== SubscriptionStatus.CANCELED

    const isResumption =
      newStatus === SubscriptionStatus.ACTIVE &&
      (subscription.isPaused() || subscription.isPastDue())

    if (isPaymentFailure) {
      const newFailureCount = subscription.failedPaymentCount + 1

      if (
        newFailureCount >= GRACE_PERIOD_FAILURE_THRESHOLD &&
        !subscription.isInGracePeriod() &&
        !subscription.isCanceled()
      ) {
        const graceEndsAt = new Date()
        graceEndsAt.setDate(graceEndsAt.getDate() + GRACE_PERIOD_DAYS)
        updated = updated.withGracePeriodAfterFailure(
          newFailureCount,
          graceEndsAt
        )
      } else {
        updated = updated.withPaymentFailure(newFailureCount)
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

  // ─────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────

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

  private async createEvent(
    subscriptionId: string,
    eventType: string,
    statusBefore: SubscriptionStatus | null,
    statusAfter: SubscriptionStatus | null,
    payload: Record<string, unknown>,
    ctx: RequestContext
  ): Promise<SubscriptionEvent> {
    const event = SubscriptionEvent.create({
      subscriptionId,
      providerEventId: null,
      providerEventType: eventType,
      statusBefore: statusBefore ?? null,
      statusAfter: statusAfter ?? null,
      payload: payload as Json
    })

    return this.subscriptionEventRepository.save(event, ctx)
  }
}
