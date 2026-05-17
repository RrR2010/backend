import { Module } from '@nestjs/common'
import { BootstrapController } from '@bootstrap/bootstrap.controller'
import { BootstrapService } from '@bootstrap/bootstrap.service'
import {
  TenantRegistrationRepository,
  PrismaTenantRegistrationRepository
} from '@bootstrap/bootstrap.repository'
import { PrismaModule } from '@shared/prisma/prisma.module'

@Module({
  imports: [PrismaModule],

  controllers: [BootstrapController],

  providers: [
    BootstrapService,
    {
      provide: TenantRegistrationRepository,
      useClass: PrismaTenantRegistrationRepository
    }
  ],

  exports: [TenantRegistrationRepository, BootstrapService]
})
export class BootstrapModule {}
