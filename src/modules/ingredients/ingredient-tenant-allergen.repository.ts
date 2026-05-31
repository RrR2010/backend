import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { IngredientTenantAllergen } from '@ingredients/ingredient-tenant-allergen.entity'
import { Id } from '@shared/value-objects'
import {
  IngredientTenantAllergen as PrismaIngredientTenantAllergen,
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
export class PrismaIngredientTenantAllergenRepository implements IngredientTenantAllergenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<IngredientTenantAllergen[]> {
    const where: Prisma.IngredientTenantAllergenWhereInput = { ingredientId }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const entries = await this.prisma.ingredientTenantAllergen.findMany({
      where
    })
    return entries.map((e) => PrismaIngredientTenantAllergenMapper.toDomain(e))
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
    const prismaData = PrismaIngredientTenantAllergenMapper.toPersistence(entry)
    await this.prisma.ingredientTenantAllergen.upsert({
      where: { id: entry.id.value },
      update: prismaData,
      create: prismaData
    })
    return entry
  }

  async remove(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.IngredientTenantAllergenWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    await this.prisma.ingredientTenantAllergen.delete({ where })
  }

  async removeAllForIngredient(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<void> {
    const where: Prisma.IngredientTenantAllergenWhereInput = { ingredientId }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    await this.prisma.ingredientTenantAllergen.deleteMany({ where })
  }
}

class PrismaIngredientTenantAllergenMapper {
  static toDomain(e: PrismaIngredientTenantAllergen): IngredientTenantAllergen {
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
  ): Prisma.IngredientTenantAllergenUncheckedCreateInput {
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
