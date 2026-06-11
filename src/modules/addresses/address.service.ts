import { Injectable, ForbiddenException } from '@nestjs/common'
import { AddressRepository, AddressFilter } from '@addresses/address.repository'
import { Address, CreateAddressProps } from '@addresses/address.entity'
import { AddressNotFoundError } from '@addresses/address.errors'
import { RequestContext } from '@authorization/authorization.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

@Injectable()
export class AddressService {
  constructor(private readonly repository: AddressRepository) {}

  async create(
    props: Omit<CreateAddressProps, 'tenantId'>,
    ctx: RequestContext
  ): Promise<Address> {
    const tenantId = getEffectiveTenantId(ctx)
    if (!tenantId) {
      throw new ForbiddenException(
        'Cannot create Address: tenant context is required. Ensure the request has a valid tenant scope.'
      )
    }
    const address = Address.create({ ...props, tenantId })
    return this.repository.save(address, ctx)
  }

  async findAll(
    filter: AddressFilter,
    ctx: RequestContext
  ): Promise<Address[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(id: string, ctx: RequestContext): Promise<Address> {
    const address = await this.repository.findById(id, ctx)
    if (!address) {
      throw new AddressNotFoundError(id)
    }
    return address
  }

  async save(address: Address, ctx: RequestContext): Promise<Address> {
    return this.repository.save(address, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const address = await this.findById(id, ctx)
    address.delete()
    await this.repository.save(address, ctx)
  }

  async activate(id: string, ctx: RequestContext): Promise<Address> {
    const address = await this.findById(id, ctx)
    address.activate()
    return this.repository.save(address, ctx)
  }

  async lock(id: string, ctx: RequestContext): Promise<Address> {
    const address = await this.findById(id, ctx)
    address.lock()
    return this.repository.save(address, ctx)
  }
}
