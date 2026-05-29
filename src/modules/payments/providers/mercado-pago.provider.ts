import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import crypto from 'crypto'
import { PaymentService } from '@payments/payment.service'
import {
  PaymentPreference,
  PaymentPreferenceResult,
  PaymentNotification,
  WebhookHeaders
} from '@payments/payment.types'
import {
  PaymentPreferenceCreationError,
  PaymentNotFoundError,
  PaymentProviderNotConfiguredError
} from '@payments/payment.errors'

// Requires `npm install mercadopago` in the backend directory.
import {
  MercadoPagoConfig,
  Preference,
  Payment,
  MerchantOrder,
  PaymentRefund
} from 'mercadopago'

@Injectable()
export class MercadoPagoProvider extends PaymentService {
  private readonly logger = new Logger(MercadoPagoProvider.name)
  private readonly webhookSecret: string
  private client: MercadoPagoConfig | null = null
  private preference: Preference | null = null
  private payment: Payment | null = null
  private merchantOrder: MerchantOrder | null = null
  private paymentRefund: PaymentRefund | null = null

  constructor(private readonly config: ConfigService) {
    super()

    this.webhookSecret = this.config.get<string>(
      'MERCADO_PAGO_WEBHOOK_SECRET',
      ''
    )
  }

  private getClient(): MercadoPagoConfig {
    if (!this.client) {
      const accessToken = this.config.get<string>(
        'MERCADO_PAGO_ACCESS_TOKEN',
        ''
      )
      if (!accessToken) {
        throw new PaymentProviderNotConfiguredError('mercadopago')
      }
      this.client = new MercadoPagoConfig({ accessToken })
      this.preference = new Preference(this.client)
      this.payment = new Payment(this.client)
      this.merchantOrder = new MerchantOrder(this.client)
      this.paymentRefund = new PaymentRefund(this.client)
    }
    return this.client
  }

  async createPreference(
    preference: PaymentPreference
  ): Promise<PaymentPreferenceResult> {
    this.getClient()
    const pref = this.preference!
    try {
      const result = await pref.create({
        body: {
          items: preference.items.map((item, index) => ({
            id: `${index + 1}`,
            title: item.title,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            currency_id: item.currency ?? 'BRL'
          })),
          external_reference: preference.externalReference,
          back_urls: {
            success: preference.backUrls.success,
            pending: preference.backUrls.pending,
            failure: preference.backUrls.failure
          },
          notification_url: preference.notificationUrl,
          ...(preference.payer && {
            payer: {
              email: preference.payer.email,
              name: preference.payer.name
            }
          })
        }
      })

      return {
        preferenceId: result.id ?? '',
        initPoint: result.init_point ?? '',
        sandboxInitPoint: result.sandbox_init_point ?? ''
      }
    } catch (error) {
      throw new PaymentPreferenceCreationError(
        `Mercado Pago API error: ${error instanceof Error ? error.message : String(error)}`,
        error
      )
    }
  }

  async getPayment(paymentId: string): Promise<PaymentNotification> {
    this.getClient()
    const pay = this.payment!
    try {
      const result = await pay.get({ id: paymentId })

      const status = this.mapStatus(result.status)

      return {
        paymentId: result.id?.toString() ?? paymentId,
        externalReference: result.external_reference ?? '',
        status,
        statusDetail: result.status_detail ?? ''
      }
    } catch (error) {
      throw new PaymentNotFoundError(paymentId)
    }
  }

  async getMerchantOrder(orderId: string): Promise<{
    externalReference: string
    payments: Array<{ status: string }>
  }> {
    this.getClient()
    const order = this.merchantOrder!
    try {
      const result = await order.get({ merchantOrderId: orderId })
      return {
        externalReference: result.external_reference ?? '',
        payments:
          result.payments?.map((p) => ({ status: p.status ?? '' })) ?? []
      }
    } catch (error) {
      throw new PaymentNotFoundError(orderId)
    }
  }

  async searchPaymentsByExternalRef(
    externalReference: string
  ): Promise<Array<{ paymentId: string; status: string }>> {
    this.getClient()
    const pay = this.payment!
    try {
      const result = await pay.search({
        options: {
          external_reference: externalReference
        }
      })
      return (result.results ?? []).map((p) => ({
        paymentId: p.id?.toString() ?? '',
        status: p.status ?? ''
      }))
    } catch (error) {
      this.logger.error('Failed to search payments', {
        externalReference,
        error: error instanceof Error ? error.message : String(error)
      })
      return []
    }
  }

  async refundPayment(
    paymentId: string
  ): Promise<{ refundId: string; status: string }> {
    this.getClient()
    const refund = this.paymentRefund!
    try {
      const result = await refund.total({ payment_id: paymentId })
      return {
        refundId: result.id?.toString() ?? '',
        status: result.status ?? 'unknown'
      }
    } catch (error) {
      this.logger.error('Failed to refund payment', {
        paymentId,
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }

  validateWebhookSignature(
    headers: WebhookHeaders,
    body: unknown,
    queryParams?: Record<string, unknown>
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

    // Extract dataId from query params (Mercado Pago v2 spec)
    const rawId = queryParams?.['data.id']
    const dataId = typeof rawId === 'string' ? rawId : null

    if (!dataId) return false

    // Build message template per MP v2 spec
    const message = `id:${dataId};request-id:${xRequestId};ts=${ts};`

    // Compute HMAC-SHA256
    const hmac = crypto.createHmac('sha256', this.webhookSecret)
    const computed = hmac.update(message).digest('hex')

    // Compare using timing-safe comparison
    const computedBuffer = Buffer.from(computed)
    const expectedBuffer = Buffer.from(v1)
    if (computedBuffer.length !== expectedBuffer.length) return false
    return crypto.timingSafeEqual(computedBuffer, expectedBuffer)
  }

  /**
   * Maps Mercado Pago status strings to our internal status enum.
   */
  private mapStatus(
    mpStatus: string | undefined
  ): PaymentNotification['status'] {
    switch (mpStatus) {
      case 'approved':
        return 'approved'
      case 'pending':
        return 'pending'
      case 'in_process':
        return 'pending'
      case 'in_mediation':
        return 'pending'
      case 'rejected':
        return 'rejected'
      case 'cancelled':
        return 'cancelled'
      case 'refunded':
        return 'cancelled'
      case 'charged_back':
        return 'cancelled'
      default:
        return 'pending'
    }
  }
}
