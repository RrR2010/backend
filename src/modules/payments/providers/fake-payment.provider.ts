import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PaymentService } from '@payments/payment.service'
import {
  PaymentPreference,
  PaymentPreferenceResult,
  PaymentNotification,
  WebhookHeaders
} from '@payments/payment.types'

/**
 * In-memory store for fake payment statuses.
 * Keyed by externalReference so that the fake approval endpoint (Phase 7)
 * can update the status and getPayment() can read it.
 */
// TODO: This in-memory store is dev-only. It will not work in multi-worker
// deployments (PM2 cluster, Kubernetes pods) where each process has its own memory.
// For production, use a shared store (Redis, database, etc.).
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

    // Store a default pending payment in the in-memory map
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
    // Try to find by exact paymentId first
    for (const [, notification] of fakePaymentStore.entries()) {
      if (notification.paymentId === paymentId) {
        return notification
      }
    }

    // Try to find by externalReference (paymentId might be the externalReference)
    const stored = fakePaymentStore.get(paymentId)
    if (stored) {
      return stored
    }

    // If paymentId starts with the fake-approved prefix, return approved status
    if (paymentId.startsWith('fake-approved-')) {
      return {
        paymentId,
        externalReference: paymentId.replace('fake-approved-', ''),
        status: 'approved',
        statusDetail: 'Fake approval for testing'
      }
    }

    // Default: return pending
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
    // Always return true in development
    return true
  }

  /**
   * Helper method for the fake approval endpoint (Phase 7).
   * Updates the payment status for a given externalReference.
   */
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
