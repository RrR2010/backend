import { Injectable } from '@nestjs/common'
import { AddressRepository, AddressFilter } from '@addresses/address.repository'
import { Address, CreateAddressProps } from '@addresses/address.entity'
import { AddressNotFoundError } from '@addresses/address.errors'
import { RequestContext } from '@authorization/authorization.types'

@Injectable()
export class AddressService {
  constructor(private readonly repository: AddressRepository) {}

  async create(props: CreateAddressProps, context: RequestContext): Promise<Address> {
    const address = Address.create(props)
    return this.repository.save(address)
  }

  async findAll(filter?: AddressFilter, context?: RequestContext): Promise<Address[]> {
    return this.repository.findAll(filter)
  }

  async findById(id: string, context: RequestContext): Promise<Address> {
    const address = await this.repository.findById(id)
    if (!address) {
      throw new AddressNotFoundError(id)
    }
    return address
  }

  async save(address: Address, context: RequestContext): Promise<Address> {
    return this.repository.save(address)
  }

  async delete(id: string, context: RequestContext): Promise<void> {
    const address = await this.findById(id, context)
    address.delete()
    await this.repository.save(address)
  }

  async activate(id: string, context: RequestContext): Promise<Address> {
    const address = await this.findById(id, context)
    address.activate()
    return this.repository.save(address)
  }

  async lock(id: string, context: RequestContext): Promise<Address> {
    const address = await this.findById(id, context)
    address.lock()
    return this.repository.save(address)
  }
}