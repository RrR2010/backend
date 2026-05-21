import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { IngredientNutrient } from '@ingredients/ingredient-nutrient.entity'
import { Id } from '@shared/value-objects'
import { IngredientNutrient as PrismaIngredientNutrient, Prisma } from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'

export abstract class IngredientNutrientRepository {
  abstract findByIngredientId(ingredientId: string, ctx: RequestContext): Promise<IngredientNutrient[]>
  abstract add(entry: IngredientNutrient, ctx: RequestContext): Promise<IngredientNutrient>
  abstract remove(id: string, ctx: RequestContext): Promise<void>
  abstract removeAllForIngredient(ingredientId: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaIngredientNutrientRepository implements IngredientNutrientRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByIngredientId(ingredientId: string, ctx: RequestContext): Promise<IngredientNutrient[]> {
    const where: Prisma.IngredientNutrientWhereInput = { ingredientId }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    const entries = await this.prisma.ingredientNutrient.findMany({ where })
    return entries.map((e) => PrismaIngredientNutrientMapper.toDomain(e))
  }

  async add(entry: IngredientNutrient, ctx: RequestContext): Promise<IngredientNutrient> {
    if (ctx.scope === UserScope.TENANT && entry.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    entry.touch()
    const prismaData = PrismaIngredientNutrientMapper.toPersistence(entry)
    await this.prisma.ingredientNutrient.upsert({
      where: { id: entry.id.value },
      update: prismaData,
      create: prismaData
    })
    return entry
  }

  async remove(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.IngredientNutrientWhereUniqueInput = { id }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    await this.prisma.ingredientNutrient.delete({ where })
  }

  async removeAllForIngredient(ingredientId: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.IngredientNutrientWhereInput = { ingredientId }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    await this.prisma.ingredientNutrient.deleteMany({ where })
  }
}

class PrismaIngredientNutrientMapper {
  static toDomain(e: PrismaIngredientNutrient): IngredientNutrient {
    return IngredientNutrient.rehydrate({
      id: Id.from(e.id),
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      tenantId: e.tenantId,
      ingredientId: e.ingredientId,
      nutrientId: e.nutrientId,
      value: e.value?.toNumber() ?? null
    })
  }

  static toPersistence(entry: IngredientNutrient): Prisma.IngredientNutrientUncheckedCreateInput {
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
