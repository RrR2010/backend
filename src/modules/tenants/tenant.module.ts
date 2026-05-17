import { Module } from '@nestjs/common'
import { TenantsController } from '@tenants/tenant.controller'
import { TenantService } from '@tenants/tenant.service'
import {
  TenantRepository,
  PrismaTenantRepository
} from '@tenants/tenant.repository'
import { PrismaModule } from '@shared/prisma/prisma.module'

@Module({
  imports: [PrismaModule],

  controllers: [TenantsController],

  providers: [
    TenantService,
    {
      provide: TenantRepository,
      useClass: PrismaTenantRepository
    }
  ],

  exports: [TenantRepository, TenantService]
})
export class TenantModule {}
