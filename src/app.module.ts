import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/core/infra/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '@modules/users/users.module';
import { TenantModule } from '@modules/tenants/tenant.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    TenantModule,
    UsersModule,
  ],
})
export class AppModule {}
