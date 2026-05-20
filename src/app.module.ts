import { Module } from '@nestjs/common'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
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
import { RequestContextInterceptor } from '@shared/interceptors/request-context.interceptor'

// New modules
import { PlatformMembershipModule } from '@platform-memberships/platform-membership.module'
import { TenantMembershipModule } from '@tenant-memberships/tenant-membership.module'
import { MemberProfileModule } from '@member-profiles/member-profile.module'
import { AddressModule } from '@addresses/address.module'
import { PhoneModule } from '@phones/phone.module'
import { TenantSiteModule } from '@tenant-sites/tenant-site.module'
import { MemberProfileDocumentModule } from '@member-profile-documents/member-profile-document.module'
import { AuditLogModule } from '@audit-logs/audit-log.module'
import { BootstrapModule } from '@bootstrap/bootstrap.module'
import { PaymentModule } from '@payments/payment.module'
import { BillingModule } from '@billing/billing.module'

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
    AuthorizationModule,
    BootstrapModule,
    PaymentModule,
    BillingModule
    // CaslModule.forRoot({
    //   superuserRole: PlatformRole.ADMIN,
    //   getUserFromRequest: (request) => request.user
    // })
  ],
  providers: [
    /**
     * Global Guards order matters:
     * 1. JwtAuthGuard: Authenticates user via JWT and attaches AuthTokenPayload to request.user.
     * 2. TenantContextGuard: Determines tenant context for tenant-scoped users and attaches to request.tenantContext.
     * 3. AuthorizationGuard: Enforces CASL permissions based on request.user and request.tenantContext.
     */
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
    },
    /**
     * Global Interceptors:
     * - RequestContextInterceptor: Must run after guards to build a validated RequestContext from request.user and request.tenantContext.
     */
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestContextInterceptor
    }
  ]
})
export class AppModule {}

