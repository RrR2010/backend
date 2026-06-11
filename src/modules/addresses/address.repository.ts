import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { Address } from '@addresses/address.entity'
import { OwnerType, AddressType } from '@shared/enums'
import { SystemState } from '@shared/behaviours/lockable'
import { Address as PrismaAddress, Prisma } from '@prisma/client'
import { Id } from '@shared/value-objects'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

// Address is tenant-scoped (tenantId NOT NULL). Polymorphism is via ownerType (TenantSite, MemberProfile).

export abstract class AddressRepository {
  abstract findById(id: string, ctx: RequestContext): Promise<Address | null>
  abstract findAll(
    filter: AddressFilter,
    ctx: RequestContext
  ): Promise<Address[]>
  abstract save(address: Address, ctx: RequestContext): Promise<Address>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

export type AddressFilter = {
  ownerId?: string
  ownerType?: OwnerType
  type?: AddressType
  isDefault?: boolean
}

@Injectable()
export class PrismaAddressRepository implements AddressRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findById(id: string, ctx: RequestContext): Promise<Address | null> {
    const where: Prisma.AddressWhereInput = { id }
    const tenantId = getEffectiveTenantId(ctx)
    if (tenantId) {
      where.tenantId = tenantId
    }
    const prismaAddress = await this.prismaService.address.findFirst({
      where
    })
    if (!prismaAddress) return null
    return PrismaAddressMapper.toDomain(prismaAddress)
  }

  async findAll(
    filter: AddressFilter,
    ctx: RequestContext
  ): Promise<Address[]> {
    const where: Prisma.AddressWhereInput = {}

    if (filter.ownerId) {
      where.ownerId = filter.ownerId
    }
    if (filter.ownerType) {
      where.ownerType = filter.ownerType
    }
    if (filter.type) {
      where.type = filter.type
    }
    if (filter.isDefault !== undefined) {
      where.isDefault = filter.isDefault
    }

    const tenantId = getEffectiveTenantId(ctx)
    if (tenantId) {
      where.tenantId = tenantId
    }

    const prismaAddresses = await this.prismaService.address.findMany({ where })
    return prismaAddresses.map((prismaAddress) =>
      PrismaAddressMapper.toDomain(prismaAddress)
    )
  }

  async save(address: Address, ctx: RequestContext): Promise<Address> {
    if (ctx.scope === UserScope.TENANT && address.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    const prismaAddress = PrismaAddressMapper.toPersistence(address)

    // Guard: verify existing record belongs to the same tenant before upsert.
    // Prevents hijacking a record from another tenant via id collision.
    if (ctx.scope === UserScope.TENANT) {
      const existing = await this.prismaService.address.findFirst({
        where: { id: address.id.value }
      })
      if (existing && existing.tenantId !== address.tenantId) {
        throw new ForbiddenException('Cannot modify resource outside your tenant')
      }
    }

    await this.prismaService.address.upsert({
      where: { id: prismaAddress.id },
      update: prismaAddress,
      create: prismaAddress
    })
    return address
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.AddressWhereInput = { id }
    const tenantId = getEffectiveTenantId(ctx)
    if (tenantId) {
      where.tenantId = tenantId
    }
    await this.prismaService.address.deleteMany({
      where
    })
  }
}

class PrismaAddressMapper {
  static toDomain(prismaAddress: PrismaAddress): Address {
    return Address.rehydrate({
      id: Id.from(prismaAddress.id),
      createdAt: prismaAddress.createdAt,
      updatedAt: prismaAddress.updatedAt,
      systemState:
        SystemState[prismaAddress.systemState as keyof typeof SystemState],
      ownerId: prismaAddress.ownerId,
      ownerType: prismaAddress.ownerType as OwnerType,
      tenantId: prismaAddress.tenantId,
      type: prismaAddress.type as AddressType,
      street: prismaAddress.street,
      streetType: prismaAddress.streetType,
      number: prismaAddress.number,
      complement: prismaAddress.complement,
      district: prismaAddress.district,
      city: prismaAddress.city,
      state: prismaAddress.state,
      postalCode: prismaAddress.postalCode,
      country: prismaAddress.country,
      isDefault: prismaAddress.isDefault
    })
  }

  static toPersistence(address: Address): PrismaAddress {
    return {
      id: address.id.value,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
      systemState: address.systemState,
      ownerId: address.ownerId,
      ownerType: address.ownerType,
      tenantId: address.tenantId,
      type: address.type,
      street: address.street,
      streetType: address.streetType,
      number: address.number,
      complement: address.complement,
      district: address.district,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault
    }
  }
}
