import { Injectable, Logger } from '@nestjs/common'
import { SubscriptionProvider } from '@billing/subscription-provider.interface'
import {
  CreateSubscriptionInput,
  CreateSubscriptionResult,
  UpdateSubscriptionInput,
  ProviderSubscriptionSnapshot
} from '@billing/subscription-provider.types'
import { SubscriptionStatus } from '@shared/enums'

interface FakeSubscriptionRecord {
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

// Note: This store is isolated per worker. In multi-worker deployments (PM2 cluster mode)
// or parallel test runners, each worker has its own isolated store. For dev/testing
// purposes this is acceptable.
const fakeSubscriptionStore = new Map<string, FakeSubscriptionRecord>()

@Injectable()
export class FakeSubscriptionProvider implements SubscriptionProvider {
  readonly name = 'fake'
  private readonly logger = new Logger(FakeSubscriptionProvider.name)

  async createSubscription(
    input: CreateSubscriptionInput
  ): Promise<CreateSubscriptionResult> {
    // TODO: zod validate input
    const providerSubscriptionId = `fake-sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    const now = new Date()
    const periodEnd = new Date(now)
    periodEnd.setMonth(periodEnd.getMonth() + 1)

    const record: FakeSubscriptionRecord = {
      providerSubscriptionId,
      status:
        input.trialDays !== null && input.trialDays > 0
          ? SubscriptionStatus.TRIALING
          : SubscriptionStatus.ACTIVE,
      amount: input.amount,
      currency: input.currency,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      paused: false,
      lastError: null,
      raw: { ...input, createdAt: now.toISOString() }
    }

    fakeSubscriptionStore.set(providerSubscriptionId, record)

    this.logger.log(`Fake subscription created: ${providerSubscriptionId}`)

    return {
      providerSubscriptionId,
      providerPreapprovalId: null,
      providerCustomerId: null,
      paymentUrl: `http://localhost:3001/billing/fake-approve/${providerSubscriptionId}`,
      status: record.status
    }
  }

  async updateSubscription(input: UpdateSubscriptionInput): Promise<void> {
    // TODO: zod validate input
    const record = fakeSubscriptionStore.get(input.providerSubscriptionId)
    if (!record) {
      throw new Error(
        `Fake subscription not found: ${input.providerSubscriptionId}`
      )
    }

    record.amount = input.amount
    record.raw = {
      ...record.raw,
      updatedAt: new Date().toISOString(),
      reason: input.reason
    }

    this.logger.log(
      `Fake subscription updated: ${input.providerSubscriptionId}, new amount: ${input.amount}`
    )
  }

  async cancelSubscription(
    providerSubscriptionId: string,
    cancelAtPeriodEnd: boolean
  ): Promise<void> {
    const record = fakeSubscriptionStore.get(providerSubscriptionId)
    if (!record) {
      throw new Error(`Fake subscription not found: ${providerSubscriptionId}`)
    }

    if (cancelAtPeriodEnd) {
      record.cancelAtPeriodEnd = true
      this.logger.log(
        `Fake subscription marked for cancellation at period end: ${providerSubscriptionId}`
      )
    } else {
      record.status = SubscriptionStatus.CANCELED
      this.logger.log(
        `Fake subscription canceled immediately: ${providerSubscriptionId}`
      )
    }
  }

  async pauseSubscription(providerSubscriptionId: string): Promise<void> {
    const record = fakeSubscriptionStore.get(providerSubscriptionId)
    if (!record) {
      throw new Error(`Fake subscription not found: ${providerSubscriptionId}`)
    }

    record.paused = true
    record.status = SubscriptionStatus.PAUSED
    this.logger.log(`Fake subscription paused: ${providerSubscriptionId}`)
  }

  async resumeSubscription(providerSubscriptionId: string): Promise<void> {
    const record = fakeSubscriptionStore.get(providerSubscriptionId)
    if (!record) {
      throw new Error(`Fake subscription not found: ${providerSubscriptionId}`)
    }

    record.paused = false
    record.status = SubscriptionStatus.ACTIVE
    this.logger.log(`Fake subscription resumed: ${providerSubscriptionId}`)
  }

  async getSubscription(
    providerSubscriptionId: string
  ): Promise<ProviderSubscriptionSnapshot> {
    const record = fakeSubscriptionStore.get(providerSubscriptionId)
    if (!record) {
      throw new Error(`Fake subscription not found: ${providerSubscriptionId}`)
    }

    return { ...record }
  }

  validateWebhookSignature(
    _headers: Record<string, string>,
    _body: unknown
  ): boolean {
    return true
  }

  // Dev-only helper to simulate payment approval
  approveSubscription(providerSubscriptionId: string): boolean {
    const record = fakeSubscriptionStore.get(providerSubscriptionId)
    if (!record) return false

    record.status = SubscriptionStatus.ACTIVE
    this.logger.log(`Fake subscription approved: ${providerSubscriptionId}`)
    return true
  }

  // Dev-only helper to simulate payment failure
  failSubscription(providerSubscriptionId: string): boolean {
    const record = fakeSubscriptionStore.get(providerSubscriptionId)
    if (!record) return false

    record.status = SubscriptionStatus.PAST_DUE
    record.lastError = 'Simulated payment failure'
    this.logger.log(`Fake subscription failed: ${providerSubscriptionId}`)
    return true
  }

  // Test-only helper to clear the in-memory store between test runs
  static clear(): void {
    fakeSubscriptionStore.clear()
  }
}
