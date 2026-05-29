import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { IngredientTenantNutrient } from '@ingredients/ingredient-tenant-nutrient.entity'
import { Id } from '@shared/value-objects'
import {
  IngredientTenantNutrient as PrismaIngredientTenantNutrient,
  Prisma
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'

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
export class PrismaIngredientTenantNutrientRepository implements IngredientTenantNutrientRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<IngredientTenantNutrient[]> {
    const where: Prisma.IngredientTenantNutrientWhereInput = { ingredientId }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    const entries = await this.prisma.ingredientTenantNutrient.findMany({
      where
    })
    return entries.map((e) => PrismaIngredientTenantNutrientMapper.toDomain(e))
  }

  async add(
    entry: IngredientTenantNutrient,
    ctx: RequestContext
  ): Promise<IngredientTenantNutrient> {
    if (ctx.scope === UserScope.TENANT && entry.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    entry.touch()
    const prismaData = PrismaIngredientTenantNutrientMapper.toPersistence(entry)
    await this.prisma.ingredientTenantNutrient.upsert({
      where: { id: entry.id.value },
      update: prismaData,
      create: prismaData
    })
    return entry
  }

  async remove(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.IngredientTenantNutrientWhereUniqueInput = { id }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    await this.prisma.ingredientTenantNutrient.delete({ where })
  }

  async removeAllForIngredient(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<void> {
    const where: Prisma.IngredientTenantNutrientWhereInput = { ingredientId }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    await this.prisma.ingredientTenantNutrient.deleteMany({ where })
  }
}

class PrismaIngredientTenantNutrientMapper {
  static toDomain(e: PrismaIngredientTenantNutrient): IngredientTenantNutrient {
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
  ): Prisma.IngredientTenantNutrientUncheckedCreateInput {
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
