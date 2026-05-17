import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AdminController } from '@admin/admin.controller'
import { AdminService } from '@admin/admin.service'
import { IdentityModule } from '@identities/identity.module'
import { UsersModule } from '@users/users.module'
import { AuthenticationModule } from '@authentication/authentication.module'
import { PlatformMembershipModule } from '@platform-memberships/platform-membership.module'
import { MemberProfileModule } from '@member-profiles/member-profile.module'

@Module({
  imports: [
    ConfigModule,
    IdentityModule,
    UsersModule,
    AuthenticationModule,
    PlatformMembershipModule,
    MemberProfileModule
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService]
})
export class AdminModule {}
