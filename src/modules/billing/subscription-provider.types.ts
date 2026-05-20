import { Logger } from '@nestjs/common'
import { PlanType, SubscriptionStatus } from '@shared/enums'

// Logger instance for status mapping warnings (avoids console.warn)
const logger = new Logger('MercadoPagoStatusMapper')

// ============== INPUT TYPES ==============

export interface CreateSubscriptionInput {
  tenantId: string
  planType: PlanType
  amount: number
  currency: 'BRL'
  payerEmail: string
  payerName: string
  backUrlSuccess: string
  backUrlPending: string
  backUrlFailure: string
  webhookUrl: string
  trialDays: number | null
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
  providerPreapprovalId: string | null
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
 * Maps Mercado Pago preapproval status strings to our internal SubscriptionStatus enum.
 *
 * Mercado Pago preapproval statuses:
 * - 'pending': awaiting payer authorization → maps to TRIALING (not yet active)
 * - 'authorized': active and charging → maps to ACTIVE
 * - 'paused': temporarily suspended → maps to PAUSED
 * - 'cancelled': ended by user or system → maps to CANCELED
 * - 'expired': ended due to time or failures → maps to EXPIRED
 */
export function mapMercadoPagoStatus(
  mpStatus: string | undefined
): SubscriptionStatus {
  switch (mpStatus) {
    case 'authorized':
      return SubscriptionStatus.ACTIVE
    case 'pending':
      return SubscriptionStatus.TRIALING
    case 'paused':
      return SubscriptionStatus.PAUSED
    case 'cancelled':
      return SubscriptionStatus.CANCELED
    case 'expired':
      return SubscriptionStatus.EXPIRED
    default:
      logger.warn(`Unknown MP status: "${mpStatus}", defaulting to PAST_DUE`)
      return SubscriptionStatus.PAST_DUE
  }
}
