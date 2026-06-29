import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { IngredientAllergen_TE } from '@ingredients/ingredient-allergen-te.entity'
import { Id } from '@shared/value-objects'
import {
  IngredientAllergen_TE as PrismaIngredientAllergen_TE,
  Prisma
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

export abstract class IngredientAllergen_TE_Repository {
  abstract findByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<IngredientAllergen_TE[]>
  abstract create(
    entry: IngredientAllergen_TE,
    ctx: RequestContext
  ): Promise<IngredientAllergen_TE>
  abstract remove(id: string, ctx: RequestContext): Promise<void>
  abstract removeAllForIngredient(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<void>
}

@Injectable()
export class PrismaIngredientAllergen_TE_Repository
  implements IngredientAllergen_TE_Repository
{
  constructor(private readonly prisma: PrismaService) {}

  async findByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<IngredientAllergen_TE[]> {
    const where: Prisma.IngredientAllergen_TEWhereInput = { ingredientId }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const entries = await this.prisma.ingredientAllergen_TE.findMany({
      where
    })
    return entries.map((entry) => PrismaIngredientAllergen_TE_Mapper.toDomain(entry))
  }

  async create(
    entry: IngredientAllergen_TE,
    ctx: RequestContext
  ): Promise<IngredientAllergen_TE> {
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId && entry.tenantId !== effectiveTenantId) {
      throw new ForbiddenException(
        'Cannot modify resource outside your tenant'
      )
    }
    entry.touch()
    const prismaData = PrismaIngredientAllergen_TE_Mapper.toPersistence(entry)
    await this.prisma.ingredientAllergen_TE.upsert({
      where: { id: entry.id.value },
      update: prismaData,
      create: prismaData
    })
    return entry
  }

  async remove(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.IngredientAllergen_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    await this.prisma.ingredientAllergen_TE.delete({ where })
  }

  async removeAllForIngredient(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<void> {
    const where: Prisma.IngredientAllergen_TEWhereInput = { ingredientId }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    await this.prisma.ingredientAllergen_TE.deleteMany({ where })
  }
}

class PrismaIngredientAllergen_TE_Mapper {
  static toDomain(
    raw: PrismaIngredientAllergen_TE
  ): IngredientAllergen_TE {
    return IngredientAllergen_TE.rehydrate({
      id: Id.from(raw.id),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      tenantId: raw.tenantId,
      ingredientId: raw.ingredientId,
      allergenId: raw.allergenId,
      relationType: raw.relationType
    })
  }

  static toPersistence(
    entry: IngredientAllergen_TE
  ): Prisma.IngredientAllergen_TEUncheckedCreateInput {
    return {
      id: entry.id.value,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      tenantId: entry.tenantId,
      ingredientId: entry.ingredientId,
      allergenId: entry.allergenId,
      relationType: entry.relationType
    }
  }
}
