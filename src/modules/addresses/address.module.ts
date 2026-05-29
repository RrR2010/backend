import { Module } from '@nestjs/common'

import {
  AddressRepository,
  PrismaAddressRepository
} from '@addresses/address.repository'
import { AddressService } from '@addresses/address.service'
import { AddressesController } from '@addresses/address.controller'

@Module({
  imports: [],

  controllers: [AddressesController],

  providers: [
    AddressService,
    PrismaAddressRepository,
    {
      provide: AddressRepository,
      useExisting: PrismaAddressRepository
    }
  ],

  exports: [AddressRepository, AddressService]
})
export class AddressModule {}
