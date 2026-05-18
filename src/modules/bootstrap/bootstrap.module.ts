import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { BootstrapController } from '@bootstrap/bootstrap.controller'
import { BootstrapService } from '@bootstrap/bootstrap.service'
import {
  TenantRegistrationRepository,
  PrismaTenantRegistrationRepository
} from '@bootstrap/bootstrap.repository'
import { PrismaModule } from '@shared/prisma/prisma.module'
import { PaymentModule } from '@payments/payment.module'
import { AuthenticationModule } from '@authentication/authentication.module'
import { TenantSiteModule } from '@tenant-sites/tenant-site.module'
import { IdentityModule } from '@identities/identity.module'
import { AuditLogModule } from '@audit-logs/audit-log.module'
import { UsersModule } from '@users/users.module'
import { TenantModule } from '@tenants/tenant.module'
import { TenantMembershipModule } from '@tenant-memberships/tenant-membership.module'
import { MemberProfileModule } from '@member-profiles/member-profile.module'

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    PaymentModule,
    AuthenticationModule,
    TenantSiteModule,
    IdentityModule,
    AuditLogModule,
    UsersModule,
    TenantModule,
    TenantMembershipModule,
    MemberProfileModule
  ],

  controllers: [BootstrapController],

  providers: [
    BootstrapService,
    PrismaTenantRegistrationRepository,
    {
      provide: TenantRegistrationRepository,
      useExisting: PrismaTenantRegistrationRepository
    }
  ],

  exports: [TenantRegistrationRepository]
})
export class BootstrapModule {}
