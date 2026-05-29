import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { IngredientBaseAllergen } from '@ingredients/ingredient-base-allergen.entity'
import { Id } from '@shared/value-objects'
import {
  IngredientBaseAllergen as PrismaIngredientBaseAllergen,
  Prisma
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'

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
export class PrismaIngredientBaseAllergenRepository implements IngredientBaseAllergenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<IngredientBaseAllergen[]> {
    const where: Prisma.IngredientBaseAllergenWhereInput = { ingredientId }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    const entries = await this.prisma.ingredientBaseAllergen.findMany({
      where
    })
    return entries.map((e) => PrismaIngredientBaseAllergenMapper.toDomain(e))
  }

  async create(
    entry: IngredientBaseAllergen,
    ctx: RequestContext
  ): Promise<IngredientBaseAllergen> {
    if (ctx.scope === UserScope.TENANT && entry.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    entry.touch()
    const prismaData = PrismaIngredientBaseAllergenMapper.toPersistence(entry)
    const created = await this.prisma.ingredientBaseAllergen.create({
      data: prismaData
    })
    return PrismaIngredientBaseAllergenMapper.toDomain(created)
  }

  async createMany(
    entries: IngredientBaseAllergen[],
    ctx: RequestContext
  ): Promise<IngredientBaseAllergen[]> {
    if (entries.length === 0) return []
    // Verify all entries belong to the tenant
    for (const entry of entries) {
      if (ctx.scope === UserScope.TENANT && entry.tenantId !== ctx.tenantId) {
        throw new ForbiddenException(
          'Cannot modify resource outside your tenant'
        )
      }
      entry.touch()
    }
    const prismaData = entries.map((e) =>
      PrismaIngredientBaseAllergenMapper.toPersistence(e)
    )
    await this.prisma.ingredientBaseAllergen.createMany({
      data: prismaData
    })
    return entries
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.IngredientBaseAllergenWhereUniqueInput = { id }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    await this.prisma.ingredientBaseAllergen.delete({ where })
  }

  async deleteManyByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<void> {
    const where: Prisma.IngredientBaseAllergenWhereInput = {
      ingredientId
    }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    await this.prisma.ingredientBaseAllergen.deleteMany({ where })
  }
}

class PrismaIngredientBaseAllergenMapper {
  static toDomain(e: PrismaIngredientBaseAllergen): IngredientBaseAllergen {
    return IngredientBaseAllergen.rehydrate({
      id: Id.from(e.id),
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      tenantId: e.tenantId,
      ingredientId: e.ingredientId,
      baseAllergenId: e.baseAllergenId,
      relationType: e.relationType
    })
  }

  static toPersistence(
    entry: IngredientBaseAllergen
  ): Prisma.IngredientBaseAllergenUncheckedCreateInput {
    return {
      id: entry.id.value,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      tenantId: entry.tenantId,
      ingredientId: entry.ingredientId,
      baseAllergenId: entry.baseAllergenId,
      relationType: entry.relationType
    }
  }
}
