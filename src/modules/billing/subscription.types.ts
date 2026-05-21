import { PlanType } from '@shared/enums'

// TODO: zod validate input
export interface CreateSubscriptionInput {
  tenantId: string
  planType: PlanType
  payerEmail: string
  payerName: string
  backUrlSuccess: string
  backUrlPending: string
  backUrlFailure: string
  webhookUrl: string
}

// TODO: zod validate input
export interface ChangePlanInput {
  tenantId: string
  newPlanType: PlanType
}

// TODO (2026-05-20 decisions): Update ChangePlanInput for end-of-cycle changes.
// The current interface is minimal. Consider expanding to support:
//
// export interface ChangePlanInput {
//   tenantId: string
//   newPlanType: PlanType
//   // Optional: user can confirm they understand the new amount
//   confirmNewAmount?: boolean
//   // Optional: for FREE → Paid, include payer info for provider subscription
//   payerEmail?: string
//   payerName?: string
// }
//
// Also consider adding a response type for the pending change confirmation:
//
// export interface ChangePlanResponse {
//   subscriptionId: string
//   oldPlanType: PlanType
//   newPlanType: PlanType
//   effectiveFrom: Date
//   currentAmount: number
//   newAmount: number
//   isFreeToPaid: boolean  // true if transitioning from FREE to paid
//   paymentUrl?: string    // only present if FREE → Paid (redirect to provider)
// }

// TODO: zod validate input
export interface AddUserInput {
  tenantId: string
  userId: string
}

// Grace period duration in days (configurable via env var, defaults to 3).
// NOTE: This value is read at module load time. If the env var changes at
// runtime, a server restart is required for the new value to take effect.
export const GRACE_PERIOD_DAYS = parseInt(
  process.env.GRACE_PERIOD_DAYS || '3',
  10
)

// Number of consecutive payment failures before entering grace period
export const GRACE_PERIOD_FAILURE_THRESHOLD = 3

// Default billing cycle in days when provider does not return period end date
export const DEFAULT_BILLING_CYCLE_DAYS = 30
