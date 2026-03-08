import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/core/infra/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '@modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
  ],
})
export class AppModule {}
