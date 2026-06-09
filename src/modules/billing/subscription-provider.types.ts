import { Logger } from '@nestjs/common'
import { PlanType, SubscriptionStatus } from '@shared/enums'

// Logger instance for status mapping warnings (avoids console.warn)
// TODO (EP-001 T-027): Remove this file when Mercado Pago provider is deleted
const logger = new Logger('ProviderStatusMapper')

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
  backUrlPending: string
  backUrlFailure: string
  /** Provider-specific customer ID (required by Asaas, null for MP/fake) */
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

// ============== STATUS MAPPING ==============

/**
 * Maps provider status strings to our internal SubscriptionStatus enum.
 *
 * Supported statuses:
 * - 'authorized' → ACTIVE
 * - 'pending' → PENDING
 * - 'paused' → PAUSED
 * - 'cancelled' → CANCELED
 * - 'expired' → EXPIRED
 *
 * TODO (EP-001 T-027): Remove this function when Mercado Pago provider is deleted.
 */
export function mapMercadoPagoStatus(
  mpStatus: string | undefined
): SubscriptionStatus {
  switch (mpStatus) {
    case 'authorized':
      return SubscriptionStatus.ACTIVE
    case 'pending':
      return SubscriptionStatus.PENDING
    case 'paused':
      return SubscriptionStatus.PAUSED
    case 'cancelled':
      return SubscriptionStatus.CANCELED
    case 'expired':
      return SubscriptionStatus.EXPIRED
    default:
      logger.warn(`Unknown provider status: "${mpStatus}", defaulting to ACTIVE`)
      return SubscriptionStatus.ACTIVE
  }
}
