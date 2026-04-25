import { Module } from '@nestjs/common';
import { MembershipModule } from './modules/memberships/membership.module';
import { PrismaModule } from 'src/core/infra/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '@modules/users/users.module';
import { TenantModule } from '@modules/tenants/tenant.module';
import { AuthModule } from '@modules/authentication/auth.module';
import { AdminModule } from '@modules/admin/admin.module';
import { AuthorizationModule } from '@modules/authorization/authorization.module';
import { CaslModule } from 'nest-casl';
import { PlatformRole } from '@core/domain/authorization';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthorizationModule,
    AuthModule,
    UsersModule,
    TenantModule,
    MembershipModule,
    PrismaModule,
    AdminModule,
    CaslModule.forRoot({
      superuserRole: PlatformRole.ADMIN,
      getUserFromRequest: (request) => request.user,
    }),
  ],
})
export class AppModule {}
