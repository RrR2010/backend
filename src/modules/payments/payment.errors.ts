export class PaymentPreferenceCreationError extends Error {
  constructor(message: string, cause?: unknown) {
    super(`Failed to create payment preference: ${message}`, { cause })
    this.name = 'PaymentPreferenceCreationError'
  }
}

export class PaymentNotFoundError extends Error {
  constructor(paymentId: string) {
    super(`Payment not found: ${paymentId}`)
    this.name = 'PaymentNotFoundError'
  }
}

export class InvalidWebhookSignatureError extends Error {
  constructor() {
    super('Invalid webhook signature')
    this.name = 'InvalidWebhookSignatureError'
  }
}

export class PaymentProviderNotConfiguredError extends Error {
  constructor(provider: string) {
    super(`Payment provider '${provider}' is not configured`)
    this.name = 'PaymentProviderNotConfiguredError'
  }
}
