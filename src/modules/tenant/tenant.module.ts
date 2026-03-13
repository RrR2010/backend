import { PrismaModule } from '@core/infra/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { TenantsController } from './interface/tenant.controller';
import { CreateTenantUseCase } from './application/use-cases/create-tenant.usecase';
import { ListTenantsUseCase } from './application/use-cases/list-tenants.usecase';
import { TenantRepository } from './domain/repositories/tenant.repository';
import { PrismaTenantRepository } from './infra/prisma/prisma-tenant.repository';

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
