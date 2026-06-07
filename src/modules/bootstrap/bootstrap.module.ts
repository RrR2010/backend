import { Module, forwardRef } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { BootstrapController } from '@bootstrap/bootstrap.controller'
import { BootstrapService } from '@bootstrap/bootstrap.service'
import {
  TenantRegistrationRepository,
  PrismaTenantRegistrationRepository
} from '@bootstrap/bootstrap.repository'
import { PrismaModule } from '@shared/prisma/prisma.module'
import { AuthenticationModule } from '@authentication/authentication.module'
import { TenantSiteModule } from '@tenant-sites/tenant-site.module'
import { IdentityModule } from '@identities/identity.module'
import { AuditLogModule } from '@audit-logs/audit-log.module'
import { UsersModule } from '@users/users.module'
import { TenantModule } from '@tenants/tenant.module'
import { TenantMembershipModule } from '@tenant-memberships/tenant-membership.module'
import { MemberProfileModule } from '@member-profiles/member-profile.module'
import { BillingModule } from '@billing/billing.module'
import { IngredientModule } from '@ingredients/ingredient.module'

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    AuthenticationModule,
    TenantSiteModule,
    IdentityModule,
    AuditLogModule,
    UsersModule,
    TenantModule,
    TenantMembershipModule,
    MemberProfileModule,
    forwardRef(() => BillingModule),
    IngredientModule
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

  exports: [TenantRegistrationRepository, BootstrapService]
})
export class BootstrapModule {}
