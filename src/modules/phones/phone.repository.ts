import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { Phone } from '@phones/phone.entity'
import { OwnerType, PhoneType } from '@shared/enums'
import { SystemState } from '@shared/behaviours/lockable'
import { Id } from '@shared/value-objects'
import { Phone as PrismaPhone, Prisma } from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

// EXCEÇÃO: Phone é polimórfico (pode pertencer a tenant ou a entidade global).

export abstract class PhoneRepository {
  abstract findById(id: string, ctx: RequestContext): Promise<Phone | null>
  abstract findAll(filter: PhoneFilter, ctx: RequestContext): Promise<Phone[]>
  abstract save(phone: Phone, ctx: RequestContext): Promise<Phone>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

export type PhoneFilter = {
  ownerId?: string
  ownerType?: OwnerType
  type?: PhoneType
  isDefault?: boolean
  isWhatsapp?: boolean
}

@Injectable()
export class PrismaPhoneRepository implements PhoneRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findById(id: string, ctx: RequestContext): Promise<Phone | null> {
    const where: Prisma.PhoneWhereInput = { id }
    const tenantId = getEffectiveTenantId(ctx)
    if (tenantId) {
      where.tenantId = tenantId
    }
    const prismaPhone = await this.prismaService.phone.findFirst({
      where
    })
    if (!prismaPhone) return null
    return PrismaPhoneMapper.toDomain(prismaPhone)
  }

  async findAll(filter: PhoneFilter, ctx: RequestContext): Promise<Phone[]> {
    const where: Prisma.PhoneWhereInput = {}

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
    if (filter.isWhatsapp !== undefined) {
      where.isWhatsapp = filter.isWhatsapp
    }

    const tenantId = getEffectiveTenantId(ctx)
    if (tenantId) {
      where.tenantId = tenantId
    }

    const prismaPhones = await this.prismaService.phone.findMany({ where })
    return prismaPhones.map((p) => PrismaPhoneMapper.toDomain(p))
  }

  async save(phone: Phone, ctx: RequestContext): Promise<Phone> {
    if (ctx.scope === UserScope.TENANT && phone.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    const prismaPhone = PrismaPhoneMapper.toPersistence(phone)
    await this.prismaService.phone.upsert({
      where: { id: phone.id.value },
      update: prismaPhone,
      create: prismaPhone
    })
    return phone
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.PhoneWhereInput = { id }
    const tenantId = getEffectiveTenantId(ctx)
    if (tenantId) {
      where.tenantId = tenantId
    }
    await this.prismaService.phone.deleteMany({
      where
    })
  }
}

class PrismaPhoneMapper {
  static toDomain(prismaPhone: PrismaPhone): Phone {
    return Phone.rehydrate({
      id: Id.from(prismaPhone.id),
      createdAt: prismaPhone.createdAt,
      updatedAt: prismaPhone.updatedAt,
      systemState:
        SystemState[prismaPhone.systemState as keyof typeof SystemState],
      ownerId: prismaPhone.ownerId,
      ownerType: prismaPhone.ownerType as OwnerType,
      tenantId: prismaPhone.tenantId,
      type: prismaPhone.type as PhoneType,
      countryCode: prismaPhone.countryCode,
      extension: prismaPhone.extension,
      number: prismaPhone.number,
      isWhatsapp: prismaPhone.isWhatsapp,
      isDefault: prismaPhone.isDefault
    })
  }

  static toPersistence(phone: Phone): PrismaPhone {
    return {
      id: phone.id.value,
      createdAt: phone.createdAt,
      updatedAt: phone.updatedAt,
      systemState: phone.systemState,
      ownerId: phone.ownerId,
      ownerType: phone.ownerType,
      tenantId: phone.tenantId,
      type: phone.type,
      countryCode: phone.countryCode,
      number: phone.number,
      extension: phone.extension,
      isWhatsapp: phone.isWhatsapp,
      isDefault: phone.isDefault
    }
  }
}
