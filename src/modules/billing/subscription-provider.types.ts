import { PlanType, SubscriptionStatus } from '@shared/enums'

// ============== INPUT TYPES ==============

export interface CreateSubscriptionInput {
  tenantId: string
  planType: PlanType
  amount: number
  currency: 'BRL'
  payerEmail: string
  payerName: string
  reason: string
  externalRef: string
  backUrlSuccess: string
  backUrlFailure: string
  /** Provider-specific customer ID (required by Asaas, null for fake) */
  providerCustomerId: string | null
}

export interface UpdateSubscriptionInput {
  providerSubscriptionId: string
  amount: number
  currency: 'BRL'
  reason: string | null
}

// ============== OUTPUT TYPES ==============

export interface CreateSubscriptionResult {
  providerSubscriptionId: string
  providerCustomerId: string | null
  paymentUrl: string | null
  status: SubscriptionStatus
}

export interface ProviderSubscriptionSnapshot {
  providerSubscriptionId: string
  status: SubscriptionStatus
  amount: number
  currency: string
  currentPeriodStart: Date | null
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
  paused: boolean
  lastError: string | null
  raw: Record<string, unknown>
}


