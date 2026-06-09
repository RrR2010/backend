import { Module } from '@nestjs/common'
import { WebhookController } from '@webhook/webhook.controller'
import { WebhookService } from '@webhook/webhook.service'
import { AsaasWebhookGuard } from '@webhook/asaas-webhook.guard'
import { BootstrapModule } from '@bootstrap/bootstrap.module'
import { BillingModule } from '@billing/billing.module'

@Module({
  imports: [BootstrapModule, BillingModule],
  controllers: [WebhookController],
  providers: [WebhookService, AsaasWebhookGuard],
  exports: [WebhookService]
})
export class WebhookModule {}
