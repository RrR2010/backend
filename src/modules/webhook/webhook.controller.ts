import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger'
import { WebhookService } from '@webhook/webhook.service'
import { AsaasWebhookGuard } from '@webhook/asaas-webhook.guard'
import { Public } from '@shared/decorators/public.decorator'
import type { AsaasWebhookPayload } from '@webhook/webhook.types'

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Public()
  @Post('asaas')
  @UseGuards(AsaasWebhookGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive Asaas webhook events' })
  @ApiBody({ description: 'Asaas webhook payload' })
  async handleAsaasWebhook(
    @Body() payload: AsaasWebhookPayload
  ): Promise<{ processed: boolean }> {
    return this.webhookService.handleEvent(payload)
  }
}
