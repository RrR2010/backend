import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { IngredientBaseAllergen } from '@ingredients/ingredient-base-allergen.entity'
import { Id } from '@shared/value-objects'
import {
  IngredientAllergen_TE as PrismaIngredientAllergen_TE,
  Prisma
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

export abstract class IngredientBaseAllergenRepository {
  abstract findByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<IngredientBaseAllergen[]>
  abstract create(
    entry: IngredientBaseAllergen,
    ctx: RequestContext
  ): Promise<IngredientBaseAllergen>
  abstract createMany(
    entries: IngredientBaseAllergen[],
    ctx: RequestContext
  ): Promise<IngredientBaseAllergen[]>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
  abstract deleteManyByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<void>
}

@Injectable()
export class PrismaIngredientAllergen_TERepository implements IngredientBaseAllergenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<IngredientBaseAllergen[]> {
    const where: Prisma.IngredientAllergen_TEWhereInput = { ingredientId }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const entries = await this.prisma.ingredientAllergen_TE.findMany({
      where
    })
    return entries.map((e) => PrismaIngredientAllergen_TEMapper.toDomain(e))
  }

  async create(
    entry: IngredientBaseAllergen,
    ctx: RequestContext
  ): Promise<IngredientBaseAllergen> {
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId && entry.tenantId !== effectiveTenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    entry.touch()
    const prismaData = PrismaIngredientAllergen_TEMapper.toPersistence(entry)
    const created = await this.prisma.ingredientAllergen_TE.create({
      data: prismaData
    })
    return PrismaIngredientAllergen_TEMapper.toDomain(created)
  }

  async createMany(
    entries: IngredientBaseAllergen[],
    ctx: RequestContext
  ): Promise<IngredientBaseAllergen[]> {
    if (entries.length === 0) return []
    // Verify all entries belong to the tenant
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
      PrismaIngredientAllergen_TEMapper.toPersistence(e)
    )
    await this.prisma.ingredientAllergen_TE.createMany({
      data: prismaData
    })
    return entries
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.IngredientAllergen_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    await this.prisma.ingredientAllergen_TE.delete({ where })
  }

  async deleteManyByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<void> {
    const where: Prisma.IngredientAllergen_TEWhereInput = {
      ingredientId
    }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    await this.prisma.ingredientAllergen_TE.deleteMany({ where })
  }
}

class PrismaIngredientAllergen_TEMapper {
  static toDomain(e: PrismaIngredientAllergen_TE): IngredientBaseAllergen {
    return IngredientBaseAllergen.rehydrate({
      id: Id.from(e.id),
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      tenantId: e.tenantId,
      ingredientId: e.ingredientId,
      baseAllergenId: e.allergenId,
      relationType: e.relationType
    })
  }

  static toPersistence(
    entry: IngredientBaseAllergen
  ): Prisma.IngredientAllergen_TEUncheckedCreateInput {
    return {
      id: entry.id.value,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      tenantId: entry.tenantId,
      ingredientId: entry.ingredientId,
      allergenId: entry.baseAllergenId,
      relationType: entry.relationType
    }
  }
}
