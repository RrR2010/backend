import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { TenantAllergen } from '@ingredients/tenant-allergen.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { Id } from '@shared/value-objects'
import { TenantAllergen as PrismaTenantAllergen, Prisma } from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

export type TenantAllergenFilter = {
  name?: string
  category?: string
  isActive?: boolean
  systemState?: SystemState
}

export abstract class TenantAllergenRepository {
  abstract findById(
    id: string,
    ctx: RequestContext
  ): Promise<TenantAllergen | null>
  abstract findAll(
    filter: TenantAllergenFilter,
    ctx: RequestContext
  ): Promise<TenantAllergen[]>
  abstract save(
    allergen: TenantAllergen,
    ctx: RequestContext
  ): Promise<TenantAllergen>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaTenantAllergenRepository implements TenantAllergenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<TenantAllergen | null> {
    const where: Prisma.TenantAllergenWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const prismaAllergen = await this.prisma.tenantAllergen.findUnique({
      where
    })
    if (!prismaAllergen) return null
    if (
      prismaAllergen &&
      effectiveTenantId &&
      prismaAllergen.systemState === SystemState.HIDDEN
    ) {
      return null
    }
    return PrismaTenantAllergenMapper.toDomain(prismaAllergen)
  }

  async findAll(
    filter: TenantAllergenFilter,
    ctx: RequestContext
  ): Promise<TenantAllergen[]> {
    const where: Prisma.TenantAllergenWhereInput = {
      ...(filter.name && {
        name: { contains: filter.name, mode: 'insensitive' }
      }),
      ...(filter.category && {
        category: { contains: filter.category, mode: 'insensitive' }
      }),
      ...(filter.isActive !== undefined && { isActive: filter.isActive }),
      ...(filter.systemState && { systemState: filter.systemState })
    }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    if (effectiveTenantId) {
      where.systemState = { not: SystemState.HIDDEN }
    }
    const prismaAllergens = await this.prisma.tenantAllergen.findMany({
      where,
      orderBy: { sortOrder: 'asc' }
    })
    return prismaAllergens.map((allergen) =>
      PrismaTenantAllergenMapper.toDomain(allergen)
    )
  }

  async save(
    allergen: TenantAllergen,
    ctx: RequestContext
  ): Promise<TenantAllergen> {
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId && allergen.tenantId !== effectiveTenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    const id = allergen.id.value
    const prismaAllergen = PrismaTenantAllergenMapper.toPersistence(allergen)
    await this.prisma.tenantAllergen.upsert({
      where: { id },
      update: prismaAllergen,
      create: prismaAllergen
    })
    return allergen
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.TenantAllergenWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    await this.prisma.tenantAllergen.update({
      where,
      data: { systemState: SystemState.HIDDEN, updatedAt: new Date() }
    })
  }
}

class PrismaTenantAllergenMapper {
  static toDomain(prismaAllergen: PrismaTenantAllergen): TenantAllergen {
    const systemState =
      SystemState[prismaAllergen.systemState as keyof typeof SystemState]
    if (!systemState) {
      throw new Error(
        `Invalid systemState value: ${prismaAllergen.systemState}`
      )
    }
    return TenantAllergen.rehydrate({
      id: Id.from(prismaAllergen.id),
      createdAt: prismaAllergen.createdAt,
      updatedAt: prismaAllergen.updatedAt,
      systemState,
      tenantId: prismaAllergen.tenantId,
      name: prismaAllergen.name,
      category: prismaAllergen.category,
      regulatoryRef: prismaAllergen.regulatoryRef,
      sortOrder: prismaAllergen.sortOrder,
      isActive: prismaAllergen.isActive
    })
  }

  static toPersistence(
    allergen: TenantAllergen
  ): Prisma.TenantAllergenUncheckedCreateInput {
    return {
      id: allergen.id.value,
      createdAt: allergen.createdAt,
      updatedAt: allergen.updatedAt,
      systemState: allergen.systemState,
      tenantId: allergen.tenantId,
      name: allergen.name,
      category: allergen.category,
      regulatoryRef: allergen.regulatoryRef,
      sortOrder: allergen.sortOrder,
      isActive: allergen.isActive
    }
  }
}
