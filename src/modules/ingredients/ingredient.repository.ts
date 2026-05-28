import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { Ingredient } from '@ingredients/ingredient.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { Id } from '@shared/value-objects'
import { Ingredient as PrismaIngredient, Prisma, IngredientFunctionType } from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'

export type IngredientFilter = {
  code?: string
  functionalName?: string
  commercialName?: string
  saleName?: string
  functionalGroupId?: string
  ingredientFunction?: IngredientFunctionType
  manufacturerId?: string
  supplierId?: string
  technicalSourceId?: string
  systemState?: SystemState
}

export abstract class IngredientRepository {
  abstract findById(id: string, ctx: RequestContext): Promise<Ingredient | null>
  abstract findAll(filter: IngredientFilter, ctx: RequestContext): Promise<Ingredient[]>
  abstract save(ingredient: Ingredient, ctx: RequestContext): Promise<Ingredient>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaIngredientRepository implements IngredientRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, ctx: RequestContext): Promise<Ingredient | null> {
    const where: Prisma.IngredientWhereUniqueInput = { id }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    const prismaIngredient = await this.prisma.ingredient.findUnique({ where })
    if (!prismaIngredient) return null
    if (prismaIngredient && ctx.scope === UserScope.TENANT && prismaIngredient.systemState === SystemState.HIDDEN) {
      return null
    }
    return PrismaIngredientMapper.toDomain(prismaIngredient)
  }

  async findAll(filter: IngredientFilter, ctx: RequestContext): Promise<Ingredient[]> {
    const where: Prisma.IngredientWhereInput = {
      ...(filter.code && { code: { contains: filter.code, mode: 'insensitive' } }),
      ...(filter.functionalName && { functionalName: { contains: filter.functionalName, mode: 'insensitive' } }),
      ...(filter.commercialName && { commercialName: { contains: filter.commercialName, mode: 'insensitive' } }),
      ...(filter.saleName && { saleName: { contains: filter.saleName, mode: 'insensitive' } }),
      ...(filter.functionalGroupId && { functionalGroupId: filter.functionalGroupId }),
      ...(filter.ingredientFunction && { ingredientFunction: filter.ingredientFunction }),
      ...(filter.manufacturerId && { manufacturerId: filter.manufacturerId }),
      ...(filter.supplierId && { supplierId: filter.supplierId }),
      ...(filter.technicalSourceId && { technicalSourceId: filter.technicalSourceId }),
      ...(filter.systemState && { systemState: filter.systemState })
    }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    if (ctx.scope === UserScope.TENANT) {
      where.systemState = { not: SystemState.HIDDEN }
    }
    const prismaIngredients = await this.prisma.ingredient.findMany({
      where,
      orderBy: { functionalName: 'asc' }
    })
    return prismaIngredients.map((ingredient) => PrismaIngredientMapper.toDomain(ingredient))
  }

  async save(ingredient: Ingredient, ctx: RequestContext): Promise<Ingredient> {
    if (ctx.scope === UserScope.TENANT && ingredient.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    const id = ingredient.id.value
    const prismaIngredient = PrismaIngredientMapper.toPersistence(ingredient)
    await this.prisma.ingredient.upsert({
      where: { id },
      update: prismaIngredient,
      create: prismaIngredient
    })
    return ingredient
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.IngredientWhereUniqueInput = { id }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    await this.prisma.ingredient.update({
      where,
      data: { systemState: SystemState.HIDDEN, updatedAt: new Date() }
    })
  }
}

class PrismaIngredientMapper {
  static toDomain(prismaIngredient: PrismaIngredient): Ingredient {
    const systemState = SystemState[prismaIngredient.systemState as keyof typeof SystemState]
    if (!systemState) {
      throw new Error(`Invalid systemState value: ${prismaIngredient.systemState}`)
    }
    const ingredientFunction = prismaIngredient.ingredientFunction as IngredientFunctionType
    return Ingredient.rehydrate({
      id: Id.from(prismaIngredient.id),
      createdAt: prismaIngredient.createdAt,
      updatedAt: prismaIngredient.updatedAt,
      systemState,
      tenantId: prismaIngredient.tenantId,
      code: prismaIngredient.code,
      functionalName: prismaIngredient.functionalName,
      commercialName: prismaIngredient.commercialName,
      saleName: prismaIngredient.saleName,
      functionalGroupId: prismaIngredient.functionalGroupId,
      ingredientFunction,
      notes: prismaIngredient.notes,
      manufacturerId: prismaIngredient.manufacturerId,
      supplierId: prismaIngredient.supplierId,
      technicalSourceId: prismaIngredient.technicalSourceId,
      usageIndication: prismaIngredient.usageIndication,
      ingredientsListDesc: prismaIngredient.ingredientsListDesc
    })
  }

  static toPersistence(ingredient: Ingredient): Prisma.IngredientUncheckedCreateInput {
    return {
      id: ingredient.id.value,
      createdAt: ingredient.createdAt,
      updatedAt: ingredient.updatedAt,
      systemState: ingredient.systemState,
      tenantId: ingredient.tenantId,
      code: ingredient.code,
      functionalName: ingredient.functionalName,
      commercialName: ingredient.commercialName,
      saleName: ingredient.saleName,
      functionalGroupId: ingredient.functionalGroupId,
      ingredientFunction: ingredient.ingredientFunction,
      notes: ingredient.notes,
      manufacturerId: ingredient.manufacturerId,
      supplierId: ingredient.supplierId,
      technicalSourceId: ingredient.technicalSourceId,
      usageIndication: ingredient.usageIndication,
      ingredientsListDesc: ingredient.ingredientsListDesc
    }
  }
}
