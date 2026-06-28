import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { TenantNutrient } from '@ingredients/tenant-nutrient.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { Id } from '@shared/value-objects'
import {
  TenantNutrient as PrismaTenantNutrient,
  Prisma,
  NutrientUnit,
  NutrientCategory
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

export type TenantNutrientFilter = {
  name?: string
  unit?: NutrientUnit
  category?: NutrientCategory
  isActive?: boolean
  systemState?: SystemState
}

export abstract class TenantNutrientRepository {
  abstract findById(
    id: string,
    ctx: RequestContext
  ): Promise<TenantNutrient | null>
  abstract findAll(
    filter: TenantNutrientFilter,
    ctx: RequestContext
  ): Promise<TenantNutrient[]>
  abstract save(
    nutrient: TenantNutrient,
    ctx: RequestContext
  ): Promise<TenantNutrient>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaTenantNutrientRepository implements TenantNutrientRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<TenantNutrient | null> {
    const where: Prisma.TenantNutrientWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const prismaNutrient = await this.prisma.tenantNutrient.findUnique({
      where
    })
    if (!prismaNutrient) return null
    if (
      prismaNutrient &&
      effectiveTenantId &&
      prismaNutrient.systemState === SystemState.DELETED
    ) {
      return null
    }
    return PrismaTenantNutrientMapper.toDomain(prismaNutrient)
  }

  async findAll(
    filter: TenantNutrientFilter,
    ctx: RequestContext
  ): Promise<TenantNutrient[]> {
    const where: Prisma.TenantNutrientWhereInput = {
      ...(filter.name && {
        name: { contains: filter.name, mode: 'insensitive' }
      }),
      ...(filter.unit && { unit: filter.unit }),
      ...(filter.category && { category: filter.category }),
      ...(filter.isActive !== undefined && { isActive: filter.isActive }),
      ...(filter.systemState && { systemState: filter.systemState })
    }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    if (effectiveTenantId) {
      where.systemState = { not: SystemState.DELETED }
    }
    const prismaNutrients = await this.prisma.tenantNutrient.findMany({
      where,
      orderBy: { sortOrder: 'asc' }
    })
    return prismaNutrients.map((nutrient) =>
      PrismaTenantNutrientMapper.toDomain(nutrient)
    )
  }

  async save(
    nutrient: TenantNutrient,
    ctx: RequestContext
  ): Promise<TenantNutrient> {
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId && nutrient.tenantId !== effectiveTenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    const id = nutrient.id.value
    const prismaNutrient = PrismaTenantNutrientMapper.toPersistence(nutrient)
    await this.prisma.tenantNutrient.upsert({
      where: { id },
      update: prismaNutrient,
      create: prismaNutrient
    })
    return nutrient
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.TenantNutrientWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    await this.prisma.tenantNutrient.update({
      where,
      data: { systemState: SystemState.DELETED, updatedAt: new Date() }
    })
  }
}

class PrismaTenantNutrientMapper {
  static toDomain(prismaNutrient: PrismaTenantNutrient): TenantNutrient {
    const systemState =
      SystemState[prismaNutrient.systemState as keyof typeof SystemState]
    if (!systemState) {
      throw new Error(
        `Invalid systemState value: ${prismaNutrient.systemState}`
      )
    }
    return TenantNutrient.rehydrate({
      id: Id.from(prismaNutrient.id),
      createdAt: prismaNutrient.createdAt,
      updatedAt: prismaNutrient.updatedAt,
      systemState,
      tenantId: prismaNutrient.tenantId,
      name: prismaNutrient.name,
      unit: prismaNutrient.unit,
      category: prismaNutrient.category,
      sortOrder: prismaNutrient.sortOrder,
      isActive: prismaNutrient.isActive
    })
  }

  static toPersistence(
    nutrient: TenantNutrient
  ): Prisma.TenantNutrientUncheckedCreateInput {
    return {
      id: nutrient.id.value,
      createdAt: nutrient.createdAt,
      updatedAt: nutrient.updatedAt,
      systemState: nutrient.systemState,
      tenantId: nutrient.tenantId,
      name: nutrient.name,
      unit: nutrient.unit,
      category: nutrient.category,
      sortOrder: nutrient.sortOrder,
      isActive: nutrient.isActive
    }
  }
}
