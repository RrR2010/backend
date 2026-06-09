import { Module, forwardRef } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PlanService } from '@billing/plan.service'
import { SubscriptionService } from '@billing/subscription.service'
import { SubscriptionLifecycleService } from '@billing/subscription-lifecycle.service'
import { PlanValidatorService } from '@billing/plan-validator.service'
import { PlanRepository, PrismaPlanRepository } from '@billing/plan.repository'
import {
  SubscriptionRepository,
  PrismaSubscriptionRepository
} from '@billing/subscription.repository'
import {
  SubscriptionEventRepository,
  PrismaSubscriptionEventRepository
} from '@billing/subscription-event.repository'
import { PrismaModule } from '@shared/prisma/prisma.module'
import { SubscriptionProvider } from '@billing/subscription-provider.interface'
import { FakeSubscriptionProvider } from '@billing/fake-subscription.provider'
import { MercadopagoSubscriptionProvider } from '@billing/mercadopago-subscription.provider'
import { AsaasSubscriptionProvider } from '@billing/asaas-subscription.provider'
import { AsaasApiService } from '@billing/asaas-api.service'
import { SubscriptionController } from '@billing/subscription.controller'
import { PlanController } from '@billing/plan.controller'
import { SUBSCRIPTION_PROVIDER_TOKEN } from '@billing/billing.constants'
import { TenantModule } from '@tenants/tenant.module'
import { AuditLogModule } from '@audit-logs/audit-log.module'
import { BootstrapModule } from '@bootstrap/bootstrap.module'

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    TenantModule,
    AuditLogModule,
    forwardRef(() => BootstrapModule)
  ],

  providers: [
    PlanService,
    SubscriptionService,
    SubscriptionLifecycleService,
    PlanValidatorService,
    {
      provide: PlanRepository,
      useClass: PrismaPlanRepository
    },
    {
      provide: SubscriptionRepository,
      useClass: PrismaSubscriptionRepository
    },
    {
      provide: SubscriptionEventRepository,
      useClass: PrismaSubscriptionEventRepository
    },
    FakeSubscriptionProvider,
    MercadopagoSubscriptionProvider,
    AsaasSubscriptionProvider,
    AsaasApiService,
    {
      provide: SUBSCRIPTION_PROVIDER_TOKEN,
      useFactory: (
        config: ConfigService,
        fake: FakeSubscriptionProvider,
        mp: MercadopagoSubscriptionProvider,
        asaas: AsaasSubscriptionProvider
      ): SubscriptionProvider => {
        const provider = config.get<string>('SUBSCRIPTION_PROVIDER')
        if (!provider) {
          throw new Error(
            'SUBSCRIPTION_PROVIDER is not configured. Set to "asaas", "mercadopago", or "fake" in .env.dev'
          )
        }
        if (provider === 'asaas') return asaas
        if (provider === 'mercadopago') return mp
        if (provider === 'fake') return fake
        throw new Error(
          `Invalid SUBSCRIPTION_PROVIDER: "${provider}". Must be "asaas", "mercadopago", or "fake"`
        )
      },
      inject: [
        ConfigService,
        FakeSubscriptionProvider,
        MercadopagoSubscriptionProvider,
        AsaasSubscriptionProvider
      ]
    }
  ],

  exports: [
    PlanRepository,
    PlanService,
    SubscriptionRepository,
    SubscriptionEventRepository,
    SubscriptionService,
    SubscriptionLifecycleService,
    PlanValidatorService,
    SUBSCRIPTION_PROVIDER_TOKEN,
    AsaasApiService
  ],

  controllers: [SubscriptionController, PlanController]
})
export class BillingModule {}
