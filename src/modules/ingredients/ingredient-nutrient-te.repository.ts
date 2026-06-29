import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { IngredientNutrient_TE } from '@ingredients/ingredient-nutrient-te.entity'
import { Id } from '@shared/value-objects'
import {
  IngredientNutrient_TE as PrismaIngredientNutrient_TE,
  Prisma
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

export abstract class IngredientNutrient_TE_Repository {
  abstract findByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<IngredientNutrient_TE[]>
  abstract findByNutrientId(
    nutrientId: string,
    ctx: RequestContext
  ): Promise<IngredientNutrient_TE[]>
  abstract create(
    entry: IngredientNutrient_TE,
    ctx: RequestContext
  ): Promise<IngredientNutrient_TE>
  abstract remove(id: string, ctx: RequestContext): Promise<void>
  abstract removeAllForIngredient(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<void>
}

@Injectable()
export class PrismaIngredientNutrient_TE_Repository
  implements IngredientNutrient_TE_Repository
{
  constructor(private readonly prisma: PrismaService) {}

  async findByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<IngredientNutrient_TE[]> {
    const where: Prisma.IngredientNutrient_TEWhereInput = { ingredientId }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const entries = await this.prisma.ingredientNutrient_TE.findMany({
      where
    })
return entries.map((entry) => PrismaIngredientNutrient_TE_Mapper.toDomain(entry))
    }

    async findByNutrientId(
    nutrientId: string,
    ctx: RequestContext
  ): Promise<IngredientNutrient_TE[]> {
    const where: Prisma.IngredientNutrient_TEWhereInput = { nutrientId }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const entries = await this.prisma.ingredientNutrient_TE.findMany({
      where
    })
    return entries.map((entry) => PrismaIngredientNutrient_TE_Mapper.toDomain(entry))
  }

  async create(
    entry: IngredientNutrient_TE,
    ctx: RequestContext
  ): Promise<IngredientNutrient_TE> {
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId && entry.tenantId !== effectiveTenantId) {
      throw new ForbiddenException(
        'Cannot modify resource outside your tenant'
      )
    }
    entry.touch()
    const prismaData = PrismaIngredientNutrient_TE_Mapper.toPersistence(entry)
    await this.prisma.ingredientNutrient_TE.upsert({
      where: { id: entry.id.value },
      update: prismaData,
      create: prismaData
    })
    return entry
  }

  async remove(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.IngredientNutrient_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    await this.prisma.ingredientNutrient_TE.delete({ where })
  }

  async removeAllForIngredient(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<void> {
    const where: Prisma.IngredientNutrient_TEWhereInput = { ingredientId }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    await this.prisma.ingredientNutrient_TE.deleteMany({ where })
  }
}

class PrismaIngredientNutrient_TE_Mapper {
  static toDomain(
    raw: PrismaIngredientNutrient_TE
  ): IngredientNutrient_TE {
    return IngredientNutrient_TE.rehydrate({
      id: Id.from(raw.id),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      tenantId: raw.tenantId,
      ingredientId: raw.ingredientId,
      nutrientId: raw.nutrientId,
      value: raw.value?.toNumber() ?? null,
      sourceId: raw.sourceId
    })
  }

  static toPersistence(
    entry: IngredientNutrient_TE
  ): Prisma.IngredientNutrient_TEUncheckedCreateInput {
    return {
      id: entry.id.value,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      tenantId: entry.tenantId,
      ingredientId: entry.ingredientId,
      nutrientId: entry.nutrientId,
      value: entry.value !== null ? new Prisma.Decimal(entry.value) : null,
      sourceId: entry.sourceId
    }
  }
}
