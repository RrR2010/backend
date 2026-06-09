import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger'
import { WebhookService } from '@webhook/webhook.service'
import type { AsaasWebhookPayload } from '@webhook/webhook.types'

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('asaas')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive Asaas webhook events' })
  @ApiBody({ description: 'Asaas webhook payload' })
  async handleAsaasWebhook(
    @Body() payload: AsaasWebhookPayload
  ): Promise<{ processed: boolean }> {
    return this.webhookService.handleEvent(payload)
  }
}
