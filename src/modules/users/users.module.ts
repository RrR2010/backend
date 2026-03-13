import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/core/infra/prisma/prisma.module';

import { UsersController } from './interface/users.controller';

import { CreateUserUseCase } from './application/use-cases/create-user.usecase';
import { ListUsersUseCase } from './application/use-cases/list-users.usecase';

import { UserRepository } from './domain/repositories/user.repository';
import { PrismaUserRepository } from './infra/prisma/prisma-user.repository';

@Module({
  imports: [PrismaModule],

  controllers: [UsersController],

  providers: [
    CreateUserUseCase,
    ListUsersUseCase,

    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
  ],

  exports: [UserRepository],
})
export class UsersModule {}
