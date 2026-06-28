import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { IngredientTenantAllergen } from '@ingredients/ingredient-tenant-allergen.entity'
import { Id } from '@shared/value-objects'
import {
  IngredientAllergen_TE as PrismaIngredientAllergen_TE,
  Prisma
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

export abstract class IngredientTenantAllergenRepository {
  abstract findByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<IngredientTenantAllergen[]>
  abstract add(
    entry: IngredientTenantAllergen,
    ctx: RequestContext
  ): Promise<IngredientTenantAllergen>
  abstract remove(id: string, ctx: RequestContext): Promise<void>
  abstract removeAllForIngredient(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<void>
}

@Injectable()
export class PrismaIngredientAllergen_TERepository implements IngredientTenantAllergenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<IngredientTenantAllergen[]> {
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

  async add(
    entry: IngredientTenantAllergen,
    ctx: RequestContext
  ): Promise<IngredientTenantAllergen> {
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId && entry.tenantId !== effectiveTenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    entry.touch()
    const prismaData = PrismaIngredientAllergen_TEMapper.toPersistence(entry)
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

class PrismaIngredientAllergen_TEMapper {
  static toDomain(e: PrismaIngredientAllergen_TE): IngredientTenantAllergen {
    return IngredientTenantAllergen.rehydrate({
      id: Id.from(e.id),
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      tenantId: e.tenantId,
      ingredientId: e.ingredientId,
      allergenId: e.allergenId,
      relationType: e.relationType
    })
  }

  static toPersistence(
    entry: IngredientTenantAllergen
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
