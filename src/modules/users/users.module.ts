import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '@core/infra/prisma.module';

import { UsersController } from './interface/users.controller';

import { CreateUserUseCase } from './application/create-user.usecase';
import { ListUsersUseCase } from './application/list-users.usecase';

import { UserRepository } from './domain/user.repository';
import { PrismaUserRepository } from './infra/prisma-user.repository';
import { AuthModule } from '@modules/auth/auth.module';

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule)],

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
