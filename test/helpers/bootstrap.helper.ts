import crypto from 'crypto'

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
  }>
) {
  const unique = crypto.randomUUID().slice(0, 8)
  return {
    tenantName: overrides?.tenantName ?? `Test Tenant ${unique}`,
    tenantSiteName: overrides?.tenantSiteName ?? `Test Site ${unique}`,
    tenantSiteLegalName:
      overrides?.tenantSiteLegalName ?? `Test Legal ${unique} LTDA`,
    tenantSiteTaxId: overrides?.tenantSiteTaxId ?? `${unique}000190`.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5'), // Always 14 digits: 8 unique + 000190
    fullName: overrides?.fullName ?? `Test User ${unique}`,
    email: overrides?.email ?? `test-${unique}@example.com`,
    password: overrides?.password ?? 'StrongP@ss123'
  }
}

/**
 * Creates a valid Mercado Pago webhook payload for a given registration and payment status.
 */
export function mockWebhookPayload(
  registrationExternalRef: string,
  paymentStatus: 'approved' | 'pending' | 'rejected' | 'cancelled',
  paymentId?: string
) {
  const pid = paymentId ?? `fake-${paymentStatus}-${crypto.randomUUID()}`
  return {
    action: 'payment.created',
    data: { id: pid },
    external_reference: registrationExternalRef
  }
}

/**
 * Creates valid Mercado Pago webhook headers for dev/testing.
 * The fake provider always accepts any signature.
 */
export function mockWebhookHeaders(): Record<string, string> {
  return {
    'x-signature': 'test-signature-' + crypto.randomUUID(),
    'x-request-id': crypto.randomUUID()
  }
}
