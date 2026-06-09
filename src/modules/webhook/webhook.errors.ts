import { HttpException, HttpStatus } from '@nestjs/common'

export class WebhookSignatureInvalidError extends HttpException {
  constructor() {
    super(
      {
        message: 'Webhook signature is invalid',
        code: 'WEBHOOK_SIGNATURE_INVALID'
      },
      HttpStatus.UNAUTHORIZED
    )
  }
}

export class WebhookEventUnknownError extends HttpException {
  constructor(event: string) {
    super(
      {
        message: `Unknown webhook event: ${event}`,
        code: 'WEBHOOK_EVENT_UNKNOWN'
      },
      HttpStatus.BAD_REQUEST
    )
  }
}
