import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { IngredientBaseNutrient } from '@ingredients/ingredient-base-nutrient.entity'
import { Id } from '@shared/value-objects'
import {
  IngredientNutrient_TE as PrismaIngredientNutrient_TE,
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
export class PrismaIngredientNutrient_TERepository implements IngredientBaseNutrientRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<IngredientBaseNutrient[]> {
    const where: Prisma.IngredientNutrient_TEWhereInput = {
      ingredientId
    }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const entries = await this.prisma.ingredientNutrient_TE.findMany({
      where
    })
    return entries.map((e) => PrismaIngredientNutrient_TEMapper.toDomain(e))
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
    const prismaData = PrismaIngredientNutrient_TEMapper.toPersistence(entry)
    const created = await this.prisma.ingredientNutrient_TE.create({
      data: prismaData
    })
    return PrismaIngredientNutrient_TEMapper.toDomain(created)
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
      PrismaIngredientNutrient_TEMapper.toPersistence(e)
    )
    await this.prisma.ingredientNutrient_TE.createMany({
      data: prismaData
    })
    return entries
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.IngredientNutrient_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    await this.prisma.ingredientNutrient_TE.delete({ where })
  }

  async deleteManyByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<void> {
    const where: Prisma.IngredientNutrient_TEWhereInput = {
      ingredientId
    }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    await this.prisma.ingredientNutrient_TE.deleteMany({ where })
  }
}

class PrismaIngredientNutrient_TEMapper {
  static toDomain(e: PrismaIngredientNutrient_TE): IngredientBaseNutrient {
    return IngredientBaseNutrient.rehydrate({
      id: Id.from(e.id),
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      tenantId: e.tenantId,
      ingredientId: e.ingredientId,
      baseNutrientId: e.nutrientId,
      value: e.value?.toNumber() ?? null
    })
  }

  static toPersistence(
    entry: IngredientBaseNutrient
  ): Prisma.IngredientNutrient_TEUncheckedCreateInput {
    return {
      id: entry.id.value,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      tenantId: entry.tenantId,
      ingredientId: entry.ingredientId,
      nutrientId: entry.baseNutrientId,
      value: entry.value !== null ? new Prisma.Decimal(entry.value) : null
    }
  }
}
