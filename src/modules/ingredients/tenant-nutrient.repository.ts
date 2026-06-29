import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { TenantNutrient } from '@ingredients/tenant-nutrient.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { Id } from '@shared/value-objects'
import {
  IngredientNutrient_TE as PrismaTenantNutrient,
  Prisma,
  NutrientUnit,
  NutrientCategory,
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

// TODO (T-045): TenantNutrient model removed from Prisma.
// This repository is temporarily backed by IngredientNutrient_TE until T-047
// replaces TenantNutrientRepository with IngredientNutrient_TE repository.

export type TenantNutrientFilter = {
  name?: string
  unit?: string
  category?: string
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
    const where: Prisma.IngredientNutrient_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const prismaNutrient = await this.prisma.ingredientNutrient_TE.findUnique({
      where
    })
    if (!prismaNutrient) return null
    return PrismaTenantNutrientMapper.toDomain(prismaNutrient)
  }

  async findAll(
    filter: TenantNutrientFilter,
    ctx: RequestContext
  ): Promise<TenantNutrient[]> {
    const where: Prisma.IngredientNutrient_TEWhereInput = {}
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const prismaNutrients = await this.prisma.ingredientNutrient_TE.findMany({
      where,
      orderBy: { createdAt: 'asc' }
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
    await this.prisma.ingredientNutrient_TE.upsert({
      where: { id },
      update: prismaNutrient,
      create: prismaNutrient
    })
    return nutrient
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.IngredientNutrient_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    await this.prisma.ingredientNutrient_TE.delete({ where })
  }
}

class PrismaTenantNutrientMapper {
  static toDomain(prismaNutrient: PrismaTenantNutrient): TenantNutrient {
    return TenantNutrient.rehydrate({
      id: Id.from(prismaNutrient.id),
      createdAt: prismaNutrient.createdAt,
      updatedAt: prismaNutrient.updatedAt,
      systemState: SystemState.ACTIVE,
      tenantId: prismaNutrient.tenantId,
      name: '',
      unit: NutrientUnit.G,
      category: NutrientCategory.MANDATORY_DECLARATION,
      sortOrder: 0,
      isActive: true
    })
  }

  static toPersistence(
    nutrient: TenantNutrient
  ): Prisma.IngredientNutrient_TEUncheckedCreateInput {
    return {
      id: nutrient.id.value,
      createdAt: nutrient.createdAt,
      updatedAt: nutrient.updatedAt,
      tenantId: nutrient.tenantId,
      ingredientId: '',  // TODO: map correctly in T-047
      nutrientId: '',    // TODO: map correctly in T-047
    }
  }
}
