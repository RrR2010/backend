import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AdminController } from '@admin/admin.controller'
import { AdminService } from '@admin/admin.service'
import { IdentityModule } from '@identities/identity.module'
import { UsersModule } from '@users/users.module'
import { AuthenticationModule } from '@authentication/authentication.module'

@Module({
  imports: [ConfigModule, IdentityModule, UsersModule, AuthenticationModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService]
})
export class AdminModule {}
