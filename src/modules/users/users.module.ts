import { Module } from '@nestjs/common'

import { UsersController } from '@users/users.controller'

import { UserRepository, PrismaUserRepository } from '@users/user.repository'
import { UserService } from '@users/user.service'

@Module({
  imports: [],

  controllers: [UsersController],

  providers: [
    UserService,
    PrismaUserRepository,
    {
      provide: UserRepository,
      useExisting: PrismaUserRepository
    }
  ],

  exports: [UserRepository, UserService]
})
export class UsersModule {}
