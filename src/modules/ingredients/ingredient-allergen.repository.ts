import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { IngredientAllergen } from '@ingredients/ingredient-allergen.entity'
import { Id } from '@shared/value-objects'
import { IngredientAllergen as PrismaIngredientAllergen, Prisma, AllergenRelationType } from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'

export abstract class IngredientAllergenRepository {
  abstract findByIngredientId(ingredientId: string, ctx: RequestContext): Promise<IngredientAllergen[]>
  abstract add(entry: IngredientAllergen, ctx: RequestContext): Promise<IngredientAllergen>
  abstract remove(id: string, ctx: RequestContext): Promise<void>
  abstract removeAllForIngredient(ingredientId: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaIngredientAllergenRepository implements IngredientAllergenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByIngredientId(ingredientId: string, ctx: RequestContext): Promise<IngredientAllergen[]> {
    const where: Prisma.IngredientAllergenWhereInput = { ingredientId }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    const entries = await this.prisma.ingredientAllergen.findMany({ where })
    return entries.map((e) => PrismaIngredientAllergenMapper.toDomain(e))
  }

  async add(entry: IngredientAllergen, ctx: RequestContext): Promise<IngredientAllergen> {
    if (ctx.scope === UserScope.TENANT && entry.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    entry.touch()
    const prismaData = PrismaIngredientAllergenMapper.toPersistence(entry)
    await this.prisma.ingredientAllergen.upsert({
      where: { id: entry.id.value },
      update: prismaData,
      create: prismaData
    })
    return entry
  }

  async remove(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.IngredientAllergenWhereUniqueInput = { id }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    await this.prisma.ingredientAllergen.delete({ where })
  }

  async removeAllForIngredient(ingredientId: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.IngredientAllergenWhereInput = { ingredientId }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    await this.prisma.ingredientAllergen.deleteMany({ where })
  }
}

class PrismaIngredientAllergenMapper {
  static toDomain(e: PrismaIngredientAllergen): IngredientAllergen {
    return IngredientAllergen.rehydrate({
      id: Id.from(e.id),
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      tenantId: e.tenantId,
      ingredientId: e.ingredientId,
      allergenId: e.allergenId,
      relationType: e.relationType as AllergenRelationType
    })
  }

  static toPersistence(entry: IngredientAllergen): Prisma.IngredientAllergenUncheckedCreateInput {
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
