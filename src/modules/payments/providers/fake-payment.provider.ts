import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PaymentService } from '@payments/payment.service'
import {
  PaymentPreference,
  PaymentPreferenceResult,
  PaymentNotification,
  WebhookHeaders
} from '@payments/payment.types'

const fakePaymentStore = new Map<string, PaymentNotification>()

@Injectable()
export class FakePaymentProvider extends PaymentService {
  private readonly backendUrl: string

  constructor(private readonly config: ConfigService) {
    super()
    this.backendUrl = this.config.get<string>(
      'BACKEND_URL',
      'http://localhost:3001'
    )
  }

  async createPreference(
    preference: PaymentPreference
  ): Promise<PaymentPreferenceResult> {
    const { externalReference } = preference

    fakePaymentStore.set(externalReference, {
      paymentId: `fake-${externalReference}`,
      externalReference,
      status: 'pending',
      statusDetail: 'Waiting for fake approval'
    })

    const fakeApprovalUrl = `${this.backendUrl}/bootstrap/fake-approve/${externalReference}`

    return {
      preferenceId: `fake-pref-${externalReference}`,
      initPoint: fakeApprovalUrl,
      sandboxInitPoint: fakeApprovalUrl
    }
  }

  async getPayment(paymentId: string): Promise<PaymentNotification> {
    for (const [, notification] of fakePaymentStore.entries()) {
      if (notification.paymentId === paymentId) {
        return notification
      }
    }

    const stored = fakePaymentStore.get(paymentId)
    if (stored) {
      return stored
    }

    if (paymentId.startsWith('fake-approved-')) {
      return {
        paymentId,
        externalReference: paymentId.replace('fake-approved-', ''),
        status: 'approved',
        statusDetail: 'Fake approval for testing'
      }
    }

    return {
      paymentId,
      externalReference: paymentId,
      status: 'pending',
      statusDetail: 'Fake pending payment'
    }
  }

  validateWebhookSignature(
    _headers: WebhookHeaders,
    _body: unknown,
    _queryParams?: Record<string, unknown>
  ): boolean {
    return true
  }

  async refundPayment(paymentId: string): Promise<{ refundId: string; status: string }> {
    return { refundId: `fake-refund-${paymentId}`, status: 'approved' }
  }

  approvePayment(externalReference: string): PaymentNotification | undefined {
    const existing = fakePaymentStore.get(externalReference)
    if (!existing) {
      return undefined
    }

    const updated: PaymentNotification = {
      ...existing,
      status: 'approved',
      statusDetail: 'Fake approved via dev endpoint'
    }

    fakePaymentStore.set(externalReference, updated)
    return updated
  }
}
