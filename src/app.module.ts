import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ConfigModule } from '@nestjs/config'
import { UsersModule } from '@users/users.module'
import { TenantModule } from '@tenants/tenant.module'
import { AdminModule } from '@admin/admin.module'
import { PrismaModule } from '@shared/prisma/prisma.module'
import { AuthenticationModule } from '@authentication/authentication.module'
import { IdentityModule } from '@identities/identity.module'
import { JwtAuthGuard } from '@authentication/jwt-auth.guard'
import { TenantContextGuard } from '@authentication/tenant-context.guard'
import { AuthorizationModule } from '@authorization/authorization.module'
import { AuthorizationGuard } from '@authorization/authorization.guard'

// New modules
import { PlatformMembershipModule } from '@platform-memberships/platform-membership.module'
import { TenantMembershipModule } from '@tenant-memberships/tenant-membership.module'
import { MemberProfileModule } from '@member-profiles/member-profile.module'
import { AddressModule } from '@addresses/address.module'
import { PhoneModule } from '@phones/phone.module'
import { TenantSiteModule } from '@tenant-sites/tenant-site.module'
import { MemberProfileDocumentModule } from '@member-profile-documents/member-profile-document.module'
import { AuditLogModule } from '@audit-logs/audit-log.module'

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    AuthenticationModule,
    UsersModule,
    TenantModule,
    IdentityModule,
    AdminModule,
    // New modules
    PlatformMembershipModule,
    TenantMembershipModule,
    MemberProfileModule,
    AddressModule,
    PhoneModule,
    TenantSiteModule,
    MemberProfileDocumentModule,
    AuditLogModule,
    AuthorizationModule
    // CaslModule.forRoot({
    //   superuserRole: PlatformRole.ADMIN,
    //   getUserFromRequest: (request) => request.user
    // })
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: TenantContextGuard
    },
    {
      provide: APP_GUARD,
      useClass: AuthorizationGuard
    }
  ]
})
export class AppModule {}
