import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { IngredientBaseNutrient } from '@ingredients/ingredient-base-nutrient.entity'
import { Id } from '@shared/value-objects'
import {
  IngredientBaseNutrient as PrismaIngredientBaseNutrient,
  Prisma
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

export abstract class IngredientBaseNutrientRepository {
  abstract findByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<IngredientBaseNutrient[]>
  abstract create(
    entry: IngredientBaseNutrient,
    ctx: RequestContext
  ): Promise<IngredientBaseNutrient>
  abstract createMany(
    entries: IngredientBaseNutrient[],
    ctx: RequestContext
  ): Promise<IngredientBaseNutrient[]>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
  abstract deleteManyByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<void>
}

@Injectable()
export class PrismaIngredientBaseNutrientRepository implements IngredientBaseNutrientRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<IngredientBaseNutrient[]> {
    const where: Prisma.IngredientBaseNutrientWhereInput = {
      ingredientId
    }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const entries = await this.prisma.ingredientBaseNutrient.findMany({
      where
    })
    return entries.map((e) => PrismaIngredientBaseNutrientMapper.toDomain(e))
  }

  async create(
    entry: IngredientBaseNutrient,
    ctx: RequestContext
  ): Promise<IngredientBaseNutrient> {
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId && entry.tenantId !== effectiveTenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    entry.touch()
    const prismaData = PrismaIngredientBaseNutrientMapper.toPersistence(entry)
    const created = await this.prisma.ingredientBaseNutrient.create({
      data: prismaData
    })
    return PrismaIngredientBaseNutrientMapper.toDomain(created)
  }

  async createMany(
    entries: IngredientBaseNutrient[],
    ctx: RequestContext
  ): Promise<IngredientBaseNutrient[]> {
    if (entries.length === 0) return []
    const effectiveTenantId = getEffectiveTenantId(ctx)
    for (const entry of entries) {
      if (effectiveTenantId && entry.tenantId !== effectiveTenantId) {
        throw new ForbiddenException(
          'Cannot modify resource outside your tenant'
        )
      }
      entry.touch()
    }
    const prismaData = entries.map((e) =>
      PrismaIngredientBaseNutrientMapper.toPersistence(e)
    )
    await this.prisma.ingredientBaseNutrient.createMany({
      data: prismaData
    })
    return entries
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.IngredientBaseNutrientWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    await this.prisma.ingredientBaseNutrient.delete({ where })
  }

  async deleteManyByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<void> {
    const where: Prisma.IngredientBaseNutrientWhereInput = {
      ingredientId
    }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    await this.prisma.ingredientBaseNutrient.deleteMany({ where })
  }
}

class PrismaIngredientBaseNutrientMapper {
  static toDomain(e: PrismaIngredientBaseNutrient): IngredientBaseNutrient {
    return IngredientBaseNutrient.rehydrate({
      id: Id.from(e.id),
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      tenantId: e.tenantId,
      ingredientId: e.ingredientId,
      baseNutrientId: e.baseNutrientId,
      value: e.value?.toNumber() ?? null
    })
  }

  static toPersistence(
    entry: IngredientBaseNutrient
  ): Prisma.IngredientBaseNutrientUncheckedCreateInput {
    return {
      id: entry.id.value,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      tenantId: entry.tenantId,
      ingredientId: entry.ingredientId,
      baseNutrientId: entry.baseNutrientId,
      value: entry.value !== null ? new Prisma.Decimal(entry.value) : null
    }
  }
}
