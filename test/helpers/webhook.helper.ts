import crypto from 'crypto'
import type { AsaasWebhookPayload } from '@webhook/webhook.types'

/**
 * Generates a valid BootstrapRegisterDto with randomized fields for testing.
 */
export function createTestRegistrationDto(
  overrides?: Partial<{
    tenantName: string
    tenantSiteName: string
    tenantSiteLegalName: string
    tenantSiteTaxId: string
    fullName: string
    email: string
    password: string
    planType: string
    cpf: string
  }>
) {
  const unique = crypto.randomUUID().slice(0, 8)
  return {
    tenantName: overrides?.tenantName ?? `Test Tenant ${unique}`,
    tenantSiteName: overrides?.tenantSiteName ?? `Test Site ${unique}`,
    tenantSiteLegalName:
      overrides?.tenantSiteLegalName ?? `Test Legal ${unique} LTDA`,
    tenantSiteTaxId:
      overrides?.tenantSiteTaxId ??
      `${unique}000190`.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        '$1.$2.$3/$4-$5'
      ),
    fullName: overrides?.fullName ?? `Test User ${unique}`,
    email: overrides?.email ?? `test-${unique}@example.com`,
    password: overrides?.password ?? 'StrongP@ss123',
    planType: overrides?.planType ?? 'BASIC',
    cpf: overrides?.cpf ?? `${unique}`.padEnd(11, '0').slice(0, 11)
  }
}

/**
 * Creates a valid Asaas PAYMENT_CONFIRMED webhook payload.
 */
export function createAsaasPaymentConfirmedPayload(
  subscriptionId: string,
  paymentId?: string
): AsaasWebhookPayload {
  return {
    event: 'PAYMENT_CONFIRMED',
    payment: {
      id: paymentId ?? `pay_${crypto.randomUUID()}`,
      subscription: subscriptionId,
      value: 59.9,
      netValue: 59.9,
      status: 'CONFIRMED',
      dueDate: '2026-06-10',
      billingType: 'UNDEFINED',
      invoiceUrl: null
    },
    subscription: {
      id: subscriptionId,
      status: 'ACTIVE',
      cycle: 'MONTHLY',
      value: 59.9,
      nextDueDate: '2026-07-10'
    }
  }
}

/**
 * Creates a valid Asaas PAYMENT_OVERDUE webhook payload.
 */
export function createAsaasPaymentOverduePayload(
  subscriptionId: string,
  paymentId?: string
): AsaasWebhookPayload {
  return {
    event: 'PAYMENT_OVERDUE',
    payment: {
      id: paymentId ?? `pay_${crypto.randomUUID()}`,
      subscription: subscriptionId,
      value: 59.9,
      netValue: 59.9,
      status: 'OVERDUE',
      dueDate: '2026-06-10',
      billingType: 'UNDEFINED',
      invoiceUrl: null
    },
    subscription: {
      id: subscriptionId,
      status: 'ACTIVE',
      cycle: 'MONTHLY',
      value: 59.9,
      nextDueDate: '2026-07-10'
    }
  }
}

/**
 * Creates a valid Asaas PAYMENT_REFUNDED webhook payload.
 */
export function createAsaasPaymentRefundedPayload(
  subscriptionId: string,
  paymentId?: string
): AsaasWebhookPayload {
  return {
    event: 'PAYMENT_REFUNDED',
    payment: {
      id: paymentId ?? `pay_${crypto.randomUUID()}`,
      subscription: subscriptionId,
      value: 59.9,
      netValue: 0,
      status: 'REFUNDED',
      dueDate: '2026-06-10',
      billingType: 'UNDEFINED',
      invoiceUrl: null
    },
    subscription: {
      id: subscriptionId,
      status: 'ACTIVE',
      cycle: 'MONTHLY',
      value: 59.9,
      nextDueDate: '2026-07-10'
    }
  }
}

/**
 * Valid Asaas webhook headers for testing.
 * Reads token from environment variable with a fallback for local dev.
 */
export function mockAsaasWebhookHeaders(): Record<string, string> {
  const token =
    process.env.ASAAS_WEBHOOK_AUTH_TOKEN ??
    'whsec_YBfsYJq4XUMa3KK1-6Krp-60FM8VAbrOtyJJ426mfY0'
  return {
    'asaas-access-token': token,
    'content-type': 'application/json'
  }
}
