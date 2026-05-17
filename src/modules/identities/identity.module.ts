import { Module } from '@nestjs/common'

import { IdentitiesController } from '@identities/identity.controller'
import { IdentityService } from '@identities/identity.service'
import {
  IdentityRepository,
  PrismaIdentityRepository
} from '@identities/identity.repository'
import { PrismaModule } from '@shared/prisma/prisma.module'
import {
  BcryptPasswordHasher,
  PasswordHasher
} from '@authentication/password.hasher.service'

@Module({
  imports: [PrismaModule],

  controllers: [IdentitiesController],

  providers: [
    IdentityService,
    PrismaIdentityRepository,
    {
      provide: IdentityRepository,
      useExisting: PrismaIdentityRepository
    },
    { provide: PasswordHasher, useClass: BcryptPasswordHasher }
  ],

  exports: [IdentityRepository, IdentityService]
})
export class IdentityModule {}
