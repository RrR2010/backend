import { Module } from '@nestjs/common';
import { MembershipModule } from './modules/memberships/membership.module';
import { PrismaModule } from 'src/core/infra/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '@modules/users/users.module';
import { TenantModule } from '@modules/tenants/tenant.module';
import { AuthModule } from '@modules/authentication/auth.module';
import { CaslModule } from 'nest-casl';
import { PlatformRole } from '@core/domain/platform-role.enum';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    TenantModule,
    MembershipModule,
    PrismaModule,
    CaslModule.forRoot({
      superuserRole: PlatformRole.ADMIN,
      getUserFromRequest: (request) => request.user,
    }),
  ],
})
export class AppModule {}
