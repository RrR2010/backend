import { PrismaModule } from '@core/infra/prisma.module';
import { Module } from '@nestjs/common';
import { TenantsController } from './interface/tenant.controller';
import { CreateTenantUseCase } from './application/create-tenant.usecase';
import { ListTenantsUseCase } from './application/list-tenants.usecase';
import { TenantRepository } from './domain/tenant.repository';
import { PrismaTenantRepository } from './infra/prisma-tenant.repository';

@Module({
  imports: [PrismaModule],

  controllers: [TenantsController],

  providers: [
    CreateTenantUseCase,
    ListTenantsUseCase,
    { provide: TenantRepository, useClass: PrismaTenantRepository },
  ],

  exports: [TenantRepository],
})
export class TenantModule {}
