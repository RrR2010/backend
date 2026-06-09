import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SubscriptionProvider } from '@billing/subscription-provider.interface'
import {
  CreateSubscriptionInput,
  CreateSubscriptionResult,
  UpdateSubscriptionInput,
  ProviderSubscriptionSnapshot
} from '@billing/subscription-provider.types'
import { SubscriptionStatus } from '@shared/enums'
import { AsaasApiService } from '@billing/asaas-api.service'

/**
 * Maps Asaas subscription status strings to our internal SubscriptionStatus enum.
 *
 * Asaas subscription statuses:
 * - ACTIVE  → ACTIVE
 * - INACTIVE → PAUSED
 * - EXPIRED → EXPIRED
 * - anything else → ACTIVE (fallback)
 */
export function mapAsaasStatus(
  asaasStatus: string | undefined
): SubscriptionStatus {
  switch (asaasStatus) {
    case 'ACTIVE':
      return SubscriptionStatus.ACTIVE
    case 'INACTIVE':
      return SubscriptionStatus.PAUSED
    case 'EXPIRED':
      return SubscriptionStatus.EXPIRED
    default:
      Logger.warn(
        `Unknown Asaas status: "${asaasStatus}", defaulting to ACTIVE`
      )
      return SubscriptionStatus.ACTIVE
  }
}

@Injectable()
export class AsaasSubscriptionProvider implements SubscriptionProvider {
  readonly name = 'asaas'
  private readonly logger = new Logger(AsaasSubscriptionProvider.name)
  private readonly webhookAccessToken: string

  constructor(
    private readonly asaasApiService: AsaasApiService,
    private readonly config: ConfigService
  ) {
    this.webhookAccessToken = this.config.get<string>(
      'ASAAS_WEBHOOK_ACCESS_TOKEN',
      ''
    )
  }

  async createSubscription(
    input: CreateSubscriptionInput
  ): Promise<CreateSubscriptionResult> {
    // Asaas flow requires a pre-existing customer. The providerCustomerId must
    // be set by the caller (e.g., BootstrapService in T-012).
    if (input.providerCustomerId === null) {
      throw new Error(
        'AsaasSubscriptionProvider.createSubscription requires providerCustomerId. ' +
          'Ensure the Asaas customer is created before creating the subscription.'
      )
    }

    this.logger.log(
      `Creating Asaas subscription for customer: ${input.providerCustomerId}, plan: ${input.planType}`
    )

    // Build next due date: 1 day from now for immediate first charge
    const nextDueDate = new Date()
    nextDueDate.setDate(nextDueDate.getDate() + 1)
    const nextDueDateStr = nextDueDate.toISOString().split('T')[0]!

    const result = await this.asaasApiService.createSubscription({
      customer: input.providerCustomerId,
      billingType: 'UNDEFINED',
      value: input.amount / 100,
      nextDueDate: nextDueDateStr,
      cycle: 'MONTHLY',
      externalReference: input.externalRef,
      callback: {
        successUrl: input.backUrlSuccess
      }
    })

    const status = mapAsaasStatus(result.status)
    const paymentUrl = result.checkoutSession ?? result.paymentLink ?? null

    this.logger.log(
      `Asaas subscription created: ${result.id}, status: ${result.status}, paymentUrl: ${paymentUrl}`
    )

    return {
      providerSubscriptionId: result.id,
      providerCustomerId: result.customer,
      paymentUrl,
      status
    }
  }

  async updateSubscription(input: UpdateSubscriptionInput): Promise<void> {
    this.logger.log(
      `Updating Asaas subscription: ${input.providerSubscriptionId}, amount: ${input.amount}`
    )

    await this.asaasApiService.updateSubscription(
      input.providerSubscriptionId,
      {
        value: input.amount / 100
      }
    )
  }

  async cancelSubscription(
    providerSubscriptionId: string,
    cancelAtPeriodEnd: boolean
  ): Promise<void> {
    if (cancelAtPeriodEnd) {
      // Asaas does not natively support cancel-at-period-end.
      // We track this locally in the Subscription entity. The subscription
      // remains ACTIVE until the period ends, at which point we set it to
      // CANCELED locally without calling the Asaas API.
      this.logger.log(
        `Asaas subscription marked for cancellation at period end (local only): ${providerSubscriptionId}`
      )
    } else {
      this.logger.log(
        `Cancelling Asaas subscription immediately: ${providerSubscriptionId}`
      )
      await this.asaasApiService.cancelSubscription(providerSubscriptionId)
    }
  }

  async pauseSubscription(providerSubscriptionId: string): Promise<void> {
    this.logger.log(`Pausing Asaas subscription: ${providerSubscriptionId}`)

    await this.asaasApiService.updateSubscription(providerSubscriptionId, {
      status: 'INACTIVE'
    })
  }

  async resumeSubscription(providerSubscriptionId: string): Promise<void> {
    this.logger.log(`Resuming Asaas subscription: ${providerSubscriptionId}`)

    await this.asaasApiService.updateSubscription(providerSubscriptionId, {
      status: 'ACTIVE'
    })
  }

  async getSubscription(
    providerSubscriptionId: string
  ): Promise<ProviderSubscriptionSnapshot> {
    this.logger.log(`Fetching Asaas subscription: ${providerSubscriptionId}`)

    const subscription = await this.asaasApiService.getSubscription(
      providerSubscriptionId
    )

    const status = mapAsaasStatus(subscription.status)
    const paused = subscription.status === 'INACTIVE'

    this.logger.log(
      `Asaas subscription fetched: ${subscription.id}, status: ${subscription.status}`
    )

    return {
      providerSubscriptionId: subscription.id,
      status,
      amount: Math.round(subscription.value * 100),
      currency: 'BRL',
      currentPeriodStart: null, // Asaas API does not expose period start
      currentPeriodEnd: subscription.nextDueDate
        ? new Date(subscription.nextDueDate)
        : null,
      cancelAtPeriodEnd: false, // tracked locally
      paused,
      lastError: null,
      raw: subscription as unknown as Record<string, unknown>
    }
  }

  validateWebhookSignature(
    headers: Record<string, string>,
    _body: unknown
  ): boolean {
    if (!this.webhookAccessToken) {
      this.logger.warn(
        'ASAAS_WEBHOOK_ACCESS_TOKEN is not configured — webhook validation will fail'
      )
      return false
    }

    const token = headers['asaas-access-token']
    if (!token) return false

    return token === this.webhookAccessToken
  }
}
