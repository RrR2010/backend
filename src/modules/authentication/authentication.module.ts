import { Module } from '@nestjs/common'
import {
  AUTH_PROVIDERS,
  CpfAuthenticationProvider,
  EmailAuthenticationProvider
} from '@authentication/authentication.provider'
import { IdentityModule } from '@identities/identity.module'
import {
  BcryptPasswordHasher,
  PasswordHasher
} from '@authentication/password.hasher.service'
import { AuthenticationController } from '@authentication/authentication.controller'
import { SessionService } from '@authentication/session.service'
import { JwtTokenService, TokenService } from '@authentication/token.service'
import { AuthenticationService } from '@authentication/authentication.service'
import {
  PrismaSessionRepository,
  SessionRepository
} from '@authentication/session.repository'
import { JwtService } from '@nestjs/jwt'
import { PlatformMembershipModule } from '@platform-memberships/platform-membership.module'
import { TenantMembershipModule } from '@tenant-memberships/tenant-membership.module'
import { UsersModule } from '@users/users.module'
import { TenantModule } from '@tenants/tenant.module'

@Module({
  imports: [
    IdentityModule,
    PlatformMembershipModule,
    TenantMembershipModule,
    TenantModule,
    UsersModule
  ],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    EmailAuthenticationProvider,
    CpfAuthenticationProvider,
    SessionService,
    JwtService,
    { provide: SessionRepository, useClass: PrismaSessionRepository },
    { provide: PasswordHasher, useClass: BcryptPasswordHasher },
    { provide: TokenService, useClass: JwtTokenService },
    {
      provide: AUTH_PROVIDERS,
      useFactory: (
        emailProvider: EmailAuthenticationProvider,
        cpfProvider: CpfAuthenticationProvider
      ) => [emailProvider, cpfProvider],
      inject: [EmailAuthenticationProvider, CpfAuthenticationProvider]
    }
  ],
  exports: [AUTH_PROVIDERS, PasswordHasher, TokenService, SessionService]
})
export class AuthenticationModule {}
