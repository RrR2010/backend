import { Module } from '@nestjs/common';
import { MembershipModule } from './modules/memberships/membership.module';
import { PrismaModule } from 'src/core/infra/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '@modules/users/users.module';
import { TenantModule } from '@modules/tenants/tenant.module';
import { AuthModule } from '@modules/auth/auth.module';
import { PermissionsModule } from '@modules/permissions/permissions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    TenantModule,
    MembershipModule,
    PrismaModule,
    PermissionsModule,
  ],
})
export class AppModule {}
