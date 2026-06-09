import { Module } from '@nestjs/common'
import { WebhookController } from '@webhook/webhook.controller'
import { WebhookService } from '@webhook/webhook.service'
import { BootstrapModule } from '@bootstrap/bootstrap.module'
import { BillingModule } from '@billing/billing.module'

@Module({
  imports: [BootstrapModule, BillingModule],
  controllers: [WebhookController],
  providers: [WebhookService],
  exports: [WebhookService]
})
export class WebhookModule {}
