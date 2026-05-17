import { Module } from '@nestjs/common'

import { PhoneRepository, PrismaPhoneRepository } from '@phones/phone.repository'
import { PhoneService } from '@phones/phone.service'
import { PhonesController } from '@phones/phone.controller'

@Module({
  imports: [],

  controllers: [PhonesController],

  providers: [
    PhoneService,
    PrismaPhoneRepository,
    {
      provide: PhoneRepository,
      useExisting: PrismaPhoneRepository
    }
  ],

  exports: [PhoneRepository, PhoneService]
})
export class PhoneModule {}