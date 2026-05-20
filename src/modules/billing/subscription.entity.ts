import { Id } from '@shared/value-objects'
import { SubscriptionStatus, PlanType } from '@shared/enums'

export interface SubscriptionProps {
  id: Id
  tenantId: string
  planType: PlanType
  status: SubscriptionStatus
  currency: string
  provider: string
  providerSubscriptionId: string
  providerPreapprovalId: string | null
  providerCustomerId: string | null
  basePriceSnapshot: number
  additionalUserPriceSnapshot: number | null
  includedUsersSnapshot: number
  additionalUsers: number
  currentAmount: number
  nextBillingAmount: number | null
  trialEndsAt: Date | null
  currentPeriodStart: Date | null
  currentPeriodEnd: Date | null
  graceEndsAt: Date | null
  cancelAtPeriodEnd: boolean
  failedPaymentCount: number
  lastPaymentAt: Date | null
  lastWebhookAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export class Subscription {
  readonly id: Id
  readonly tenantId: string
  readonly planType: PlanType
  readonly status: SubscriptionStatus
  readonly currency: string
  readonly provider: string
  readonly providerSubscriptionId: string
  readonly providerPreapprovalId: string | null
  readonly providerCustomerId: string | null
  readonly basePriceSnapshot: number
  readonly additionalUserPriceSnapshot: number | null
  readonly includedUsersSnapshot: number
  readonly additionalUsers: number
  readonly currentAmount: number
  readonly nextBillingAmount: number | null
  readonly trialEndsAt: Date | null
  readonly currentPeriodStart: Date | null
  readonly currentPeriodEnd: Date | null
  readonly graceEndsAt: Date | null
  readonly cancelAtPeriodEnd: boolean
  readonly failedPaymentCount: number
  readonly lastPaymentAt: Date | null
  readonly lastWebhookAt: Date | null
  readonly createdAt: Date
  readonly updatedAt: Date

  private constructor(props: SubscriptionProps) {
    this.id = props.id
    this.tenantId = props.tenantId
    this.planType = props.planType
    this.status = props.status
    this.currency = props.currency
    this.provider = props.provider
    this.providerSubscriptionId = props.providerSubscriptionId
    this.providerPreapprovalId = props.providerPreapprovalId
    this.providerCustomerId = props.providerCustomerId
    this.basePriceSnapshot = props.basePriceSnapshot
    this.additionalUserPriceSnapshot = props.additionalUserPriceSnapshot
    this.includedUsersSnapshot = props.includedUsersSnapshot
    this.additionalUsers = props.additionalUsers
    this.currentAmount = props.currentAmount
    this.nextBillingAmount = props.nextBillingAmount
    this.trialEndsAt = props.trialEndsAt
    this.currentPeriodStart = props.currentPeriodStart
    this.currentPeriodEnd = props.currentPeriodEnd
    this.graceEndsAt = props.graceEndsAt
    this.cancelAtPeriodEnd = props.cancelAtPeriodEnd
    this.failedPaymentCount = props.failedPaymentCount
    this.lastPaymentAt = props.lastPaymentAt
    this.lastWebhookAt = props.lastWebhookAt
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  // TODO: zod validate input
  static create(
    props: Omit<SubscriptionProps, 'id' | 'createdAt' | 'updatedAt'>
  ): Subscription {
    return new Subscription({
      id: Id.generate(),
      ...props,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  static rehydrate(props: SubscriptionProps): Subscription {
    return new Subscription(props)
  }

  isActive(): boolean {
    return this.status === SubscriptionStatus.ACTIVE
  }

  isTrialing(): boolean {
    return this.status === SubscriptionStatus.TRIALING
  }

  isPastDue(): boolean {
    return this.status === SubscriptionStatus.PAST_DUE
  }

  isInGracePeriod(): boolean {
    return this.status === SubscriptionStatus.GRACE
  }

  isPaused(): boolean {
    return this.status === SubscriptionStatus.PAUSED
  }

  isCanceled(): boolean {
    return this.status === SubscriptionStatus.CANCELED
  }

  isExpired(): boolean {
    return this.status === SubscriptionStatus.EXPIRED
  }

  canBeModified(): boolean {
    return (
      this.isActive() ||
      this.isTrialing() ||
      this.isPastDue() ||
      this.isInGracePeriod()
    )
  }

  canPause(): boolean {
    return this.isActive() || this.isTrialing()
  }

  canResume(): boolean {
    return this.isPaused()
  }

  canCancel(): boolean {
    return this.canBeModified() && !this.isCanceled()
  }

  getTotalUsers(): number {
    return this.includedUsersSnapshot + this.additionalUsers
  }

  withStatus(status: SubscriptionStatus): Subscription {
    return Subscription.rehydrate({
      ...this,
      status,
      updatedAt: new Date()
    })
  }

  withAdditionalUsers(
    additionalUsers: number,
    newAmount: number
  ): Subscription {
    return Subscription.rehydrate({
      ...this,
      additionalUsers,
      currentAmount: newAmount,
      updatedAt: new Date()
    })
  }

  withPlanChange(
    newPlanType: PlanType,
    newBasePrice: number,
    newIncludedUsers: number,
    newAdditionalUserPrice: number | null,
    newNextBillingAmount: number
  ): Subscription {
    return Subscription.rehydrate({
      ...this,
      planType: newPlanType,
      basePriceSnapshot: newBasePrice,
      includedUsersSnapshot: newIncludedUsers,
      additionalUserPriceSnapshot: newAdditionalUserPrice,
      currentAmount: newBasePrice,
      nextBillingAmount: newNextBillingAmount,
      updatedAt: new Date()
    })
  }

  withCancelAtPeriodEnd(cancelAtPeriodEnd: boolean): Subscription {
    return Subscription.rehydrate({
      ...this,
      cancelAtPeriodEnd,
      updatedAt: new Date()
    })
  }

  withPeriodUpdate(periodStart: Date, periodEnd: Date): Subscription {
    return Subscription.rehydrate({
      ...this,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      updatedAt: new Date()
    })
  }

  withGracePeriod(graceEndsAt: Date): Subscription {
    return Subscription.rehydrate({
      ...this,
      status: SubscriptionStatus.GRACE,
      graceEndsAt,
      updatedAt: new Date()
    })
  }

  /**
   * Combines payment failure recording and grace period entry into a single
   * state transition to avoid double-save in the repository.
   */
  withGracePeriodAfterFailure(
    failedCount: number,
    graceEndsAt: Date
  ): Subscription {
    return Subscription.rehydrate({
      ...this,
      status: SubscriptionStatus.GRACE,
      failedPaymentCount: failedCount,
      graceEndsAt,
      updatedAt: new Date()
    })
  }

  withPaymentFailure(failedCount: number): Subscription {
    return Subscription.rehydrate({
      ...this,
      status: SubscriptionStatus.PAST_DUE,
      failedPaymentCount: failedCount,
      updatedAt: new Date()
    })
  }

  /**
   * Handles a successful payment by resetting failure counter.
   * If targetStatus is provided, sets that status; otherwise defaults to ACTIVE.
   * Callers should pass the appropriate status based on current state
   * (e.g., preserve PAUSED, set ACTIVE only from PAST_DUE or GRACE).
   */
  withPaymentSuccess(
    lastPaymentAt: Date,
    targetStatus?: SubscriptionStatus
  ): Subscription {
    return Subscription.rehydrate({
      ...this,
      status: targetStatus ?? SubscriptionStatus.ACTIVE,
      failedPaymentCount: 0,
      lastPaymentAt,
      updatedAt: new Date()
    })
  }
}
