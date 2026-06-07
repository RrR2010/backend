import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import crypto from 'crypto'
import { SubscriptionProvider } from '@billing/subscription-provider.interface'
import {
  CreateSubscriptionInput,
  CreateSubscriptionResult,
  UpdateSubscriptionInput,
  ProviderSubscriptionSnapshot,
  mapMercadoPagoStatus
} from '@billing/subscription-provider.types'

// Requires `npm install mercadopago` in the backend directory.
import { MercadoPagoConfig, PreApproval } from 'mercadopago'

@Injectable()
export class MercadopagoSubscriptionProvider implements SubscriptionProvider {
  readonly name = 'mercadopago'
  private readonly logger = new Logger(MercadopagoSubscriptionProvider.name)
  private readonly webhookSecret: string
  private client: MercadoPagoConfig | null = null
  private preApproval: PreApproval | null = null

  constructor(private readonly config: ConfigService) {
    this.webhookSecret = this.config.get<string>(
      'MERCADO_PAGO_WEBHOOK_SECRET',
      ''
    )
    if (!this.webhookSecret) {
      throw new Error('MERCADO_PAGO_WEBHOOK_SECRET is not configured')
    }
  }

  private getPreApproval(): {
    client: MercadoPagoConfig
    preApproval: PreApproval
  } {
    if (!this.client) {
      const accessToken = this.config.get<string>(
        'MERCADO_PAGO_ACCESS_TOKEN',
        ''
      )
      if (!accessToken) {
        throw new Error('Mercado Pago access token is not configured')
      }
      this.client = new MercadoPagoConfig({ accessToken })
      this.preApproval = new PreApproval(this.client)
    }
    return { client: this.client, preApproval: this.preApproval! }
  }

  async createSubscription(
    input: CreateSubscriptionInput
  ): Promise<CreateSubscriptionResult> {
    // TODO: zod validate input
    const { preApproval } = this.getPreApproval()

    this.logger.log(
      `createSubscription called with payerEmail: ${input.payerEmail}, planType: ${input.planType}`
    )

    try {
      const endDate = new Date()
      endDate.setFullYear(endDate.getFullYear() + 5)

      const body: Record<string, unknown> = {
        reason: input.reason,
        external_reference: input.externalRef,
        payer_email: input.payerEmail,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: input.amount / 100,
          currency_id: input.currency,
          end_date: endDate.toISOString()
        },
        status: 'pending',
        back_url: input.backUrlSuccess
      }

      this.logger.log(`MP body: ${JSON.stringify(body, null, 2)}`)

      const result = await preApproval.create({ body })

      const providerSubscriptionId = result.id ?? ''
      const status = mapMercadoPagoStatus(result.status)

      const paymentUrl = result.init_point

      if (!paymentUrl) {
        throw new Error(
          'Mercado Pago checkout URL (init_point) is missing in response'
        )
      }

      return {
        providerSubscriptionId,
        providerCustomerId: result.payer_id?.toString() ?? null,
        paymentUrl,
        status
      }
    } catch (error) {
      const errObj = error as Record<string, unknown>
      this.logger.error('Failed to create Mercado Pago subscription', {
        tenantId: input.tenantId,
        message: errObj?.['message'] ?? 'unknown',
        status: errObj?.['status'] ?? 'unknown',
        cause: errObj?.['cause'] ?? 'none',
        fullError: JSON.stringify(errObj, Object.getOwnPropertyNames(errObj), 2)
      })
      throw error
    }
  }

  async updateSubscription(input: UpdateSubscriptionInput): Promise<void> {
    // TODO: zod validate input
    const { preApproval } = this.getPreApproval()

    try {
      await preApproval.update({
        id: input.providerSubscriptionId,
        body: {
          auto_recurring: {
            transaction_amount: input.amount / 100,
            currency_id: input.currency
          },
          reason: input.reason ?? 'Subscription amount update'
        }
      })

      this.logger.log(
        `Mercado Pago subscription updated: ${input.providerSubscriptionId}`
      )
    } catch (error) {
      this.logger.error('Failed to update Mercado Pago subscription', {
        providerSubscriptionId: input.providerSubscriptionId,
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }

  async cancelSubscription(
    providerSubscriptionId: string,
    cancelAtPeriodEnd: boolean
  ): Promise<void> {
    const { preApproval } = this.getPreApproval()

    try {
      if (cancelAtPeriodEnd) {
        // Mercado Pago Preapproval API does not natively support cancel-at-period-end.
        // We set the status to cancelled on our side and let the current cycle finish.
        // The webhook will confirm the final charge.
        this.logger.log(
          `MercadoPago subscription marked for cancellation at period end: ${providerSubscriptionId}`
        )
      } else {
        await preApproval.update({
          id: providerSubscriptionId,
          body: {
            status: 'cancelled'
          }
        })
        this.logger.log(
          `MercadoPago subscription canceled immediately: ${providerSubscriptionId}`
        )
      }
    } catch (error) {
      this.logger.error('Failed to cancel Mercado Pago subscription', {
        providerSubscriptionId,
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }

  async pauseSubscription(providerSubscriptionId: string): Promise<void> {
    const { preApproval } = this.getPreApproval()

    try {
      await preApproval.update({
        id: providerSubscriptionId,
        body: {
          status: 'paused'
        }
      })

      this.logger.log(
        `MercadoPago subscription paused: ${providerSubscriptionId}`
      )
    } catch (error) {
      this.logger.error('Failed to pause Mercado Pago subscription', {
        providerSubscriptionId,
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }

  async resumeSubscription(providerSubscriptionId: string): Promise<void> {
    const { preApproval } = this.getPreApproval()

    try {
      await preApproval.update({
        id: providerSubscriptionId,
        body: {
          status: 'authorized'
        }
      })

      this.logger.log(
        `MercadoPago subscription resumed: ${providerSubscriptionId}`
      )
    } catch (error) {
      this.logger.error('Failed to resume Mercado Pago subscription', {
        providerSubscriptionId,
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }

  async getSubscription(
    providerSubscriptionId: string
  ): Promise<ProviderSubscriptionSnapshot> {
    const { preApproval } = this.getPreApproval()

    try {
      const result = await preApproval.get({
        id: providerSubscriptionId
      })

      const status = mapMercadoPagoStatus(result.status)
      const paused = result.status === 'paused'
      // cancelAtPeriodEnd tracking should be local (in Subscription entity),
      // not inferred from MP status. MP Preapproval API does not expose this concept.
      const cancelAtPeriodEnd = false

      // MP Preapproval API does not expose period end. This should be tracked
      // locally in the Subscription entity.
      const response = result as unknown as Record<string, unknown>
      const lastChargedDate = (response['last_charged_date'] as string) || null

      // Extract last error from MP response (e.g., last_charged_error, reason)
      const lastChargedError = response['last_charged_error'] as
        | Record<string, unknown>
        | undefined
      const lastError =
        lastChargedError !== undefined
          ? ((lastChargedError['message'] as string) ??
            (lastChargedError['description'] as string) ??
            JSON.stringify(lastChargedError))
          : null

      return {
        providerSubscriptionId: (result.id as string) ?? providerSubscriptionId,
        status,
        amount: result.auto_recurring?.transaction_amount
          ? Math.round(result.auto_recurring.transaction_amount * 100)
          : 0,
        currency: (result.auto_recurring?.currency_id as string) ?? 'BRL',
        currentPeriodStart: lastChargedDate ? new Date(lastChargedDate) : null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd,
        paused,
        lastError,
        raw: result as unknown as Record<string, unknown>
      }
    } catch (error) {
      this.logger.error('Failed to get Mercado Pago subscription', {
        providerSubscriptionId,
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }

  validateWebhookSignature(
    headers: Record<string, string>,
    body: unknown
  ): boolean {
    const xSignature = headers['x-signature']
    const xRequestId = headers['x-request-id']

    if (!xSignature || !xRequestId) return false

    // Parse x-signature: "ts=1704908010,v1=618c8534..."
    const parts = xSignature.split(',')
    const tsPart = parts.find((p) => p.startsWith('ts='))
    const v1Part = parts.find((p) => p.startsWith('v1='))
    if (!tsPart || !v1Part) return false

    const ts = tsPart.slice(3)
    const v1 = v1Part.slice(3)

    // Extract dataId from body (Mercado Pago v2 spec for preapproval webhooks)
    const bodyObj = body as Record<string, unknown> | null
    const dataObj = bodyObj?.['data'] as Record<string, unknown> | undefined
    const dataId =
      typeof dataObj?.['id'] === 'string'
        ? dataObj['id']
        : typeof bodyObj?.['id'] === 'string'
          ? bodyObj['id']
          : null

    if (!dataId) return false

    // Build message template per MP v2 spec
    const message = `id:${dataId};request-id:${xRequestId};ts=${ts};`

    // Compute HMAC-SHA256
    const hmac = crypto.createHmac('sha256', this.webhookSecret)
    const computed = hmac.update(message).digest('hex')

    // Timing-safe comparison
    const computedBuffer = Buffer.from(computed)
    const expectedBuffer = Buffer.from(v1)
    if (computedBuffer.length !== expectedBuffer.length) return false
    return crypto.timingSafeEqual(computedBuffer, expectedBuffer)
  }
}
