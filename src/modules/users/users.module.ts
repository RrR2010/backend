import { Module } from '@nestjs/common';
import { PrismaModule } from '@core/infra/prisma/prisma.module';

import { UserRepository } from '@modules/users/domain/repositories/user.repository';
import { PrismaUserRepository } from '@modules/users/infra/prisma/prisma-user.repository';

@Module({
  imports: [PrismaModule],

  providers: [
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
  ],

  exports: [UserRepository],
})
export class UsersModule {}
