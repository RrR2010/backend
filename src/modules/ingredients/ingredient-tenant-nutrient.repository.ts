import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { IngredientTenantNutrient } from '@ingredients/ingredient-tenant-nutrient.entity'
import { Id } from '@shared/value-objects'
import {
  IngredientNutrient_TE as PrismaIngredientNutrient_TE,
  Prisma
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

export abstract class IngredientTenantNutrientRepository {
  abstract findByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<IngredientTenantNutrient[]>
  abstract add(
    entry: IngredientTenantNutrient,
    ctx: RequestContext
  ): Promise<IngredientTenantNutrient>
  abstract remove(id: string, ctx: RequestContext): Promise<void>
  abstract removeAllForIngredient(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<void>
}

@Injectable()
export class PrismaIngredientNutrient_TERepository implements IngredientTenantNutrientRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<IngredientTenantNutrient[]> {
    const where: Prisma.IngredientNutrient_TEWhereInput = { ingredientId }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const entries = await this.prisma.ingredientNutrient_TE.findMany({
      where
    })
    return entries.map((e) => PrismaIngredientNutrient_TEMapper.toDomain(e))
  }

  async add(
    entry: IngredientTenantNutrient,
    ctx: RequestContext
  ): Promise<IngredientTenantNutrient> {
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId && entry.tenantId !== effectiveTenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    entry.touch()
    const prismaData = PrismaIngredientNutrient_TEMapper.toPersistence(entry)
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

class PrismaIngredientNutrient_TEMapper {
  static toDomain(e: PrismaIngredientNutrient_TE): IngredientTenantNutrient {
    return IngredientTenantNutrient.rehydrate({
      id: Id.from(e.id),
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      tenantId: e.tenantId,
      ingredientId: e.ingredientId,
      nutrientId: e.nutrientId,
      value: e.value?.toNumber() ?? null
    })
  }

  static toPersistence(
    entry: IngredientTenantNutrient
  ): Prisma.IngredientNutrient_TEUncheckedCreateInput {
    return {
      id: entry.id.value,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      tenantId: entry.tenantId,
      ingredientId: entry.ingredientId,
      nutrientId: entry.nutrientId,
      value: entry.value !== null ? new Prisma.Decimal(entry.value) : null
    }
  }
}
