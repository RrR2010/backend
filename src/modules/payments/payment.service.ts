import {
  PaymentPreference,
  PaymentPreferenceResult,
  PaymentNotification,
  WebhookHeaders
} from '@payments/payment.types'

export abstract class PaymentService {
  abstract createPreference(
    preference: PaymentPreference
  ): Promise<PaymentPreferenceResult>
  abstract getPayment(paymentId: string): Promise<PaymentNotification>
  abstract validateWebhookSignature(
    headers: WebhookHeaders,
    body: unknown
  ): boolean
}
