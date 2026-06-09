import { Injectable, Logger } from '@nestjs/common'
import type { AsaasWebhookPayload } from '@webhook/webhook.types'

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name)

  /**
   * Routes an incoming Asaas webhook event to the appropriate handler.
   * Returns { processed: true } on success.
   * Currently a stub — handlers will be implemented in Wave 4.
   */
  async handleEvent(payload: AsaasWebhookPayload): Promise<{ processed: boolean }> {
    const { event } = payload

    this.logger.log(`Received webhook event: ${event}`)

    switch (event) {
      case 'PAYMENT_CONFIRMED':
      case 'PAYMENT_RECEIVED':
        return this.handlePaymentConfirmed(payload)

      case 'PAYMENT_OVERDUE':
        return this.handlePaymentOverdue(payload)

      case 'PAYMENT_REFUNDED':
        return this.handlePaymentRefunded(payload)

      case 'SUBSCRIPTION_CREATED':
      case 'SUBSCRIPTION_UPDATED':
      case 'SUBSCRIPTION_INACTIVATED':
        return this.handleSubscriptionEvent(payload)

      default:
        this.logger.warn(`Unknown webhook event: ${event}`)
        return { processed: false }
    }
  }

  private async handlePaymentConfirmed(
    payload: AsaasWebhookPayload
  ): Promise<{ processed: boolean }> {
    this.logger.log(
      `PAYMENT_CONFIRMED: subscription=${payload.payment?.subscription}`
    )
    // TODO: Implement in Wave 4 — trigger tenant provisioning
    return { processed: true }
  }

  private async handlePaymentOverdue(
    payload: AsaasWebhookPayload
  ): Promise<{ processed: boolean }> {
    this.logger.log(
      `PAYMENT_OVERDUE: subscription=${payload.payment?.subscription}`
    )
    // TODO: Implement in Wave 4 — apply grace period
    return { processed: true }
  }

  private async handlePaymentRefunded(
    payload: AsaasWebhookPayload
  ): Promise<{ processed: boolean }> {
    this.logger.log(
      `PAYMENT_REFUNDED: subscription=${payload.payment?.subscription}`
    )
    // TODO: Implement in Wave 4 — cancel subscription
    return { processed: true }
  }

  private async handleSubscriptionEvent(
    payload: AsaasWebhookPayload
  ): Promise<{ processed: boolean }> {
    this.logger.log(
      `Subscription event ${payload.event}: id=${payload.subscription?.id}`
    )
    // TODO: Implement in Wave 4 — sync subscription state
    return { processed: true }
  }
}
