import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { Ingredient_TE } from '@ingredients/ingredient.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { Id } from '@shared/value-objects'
import {
  Ingredient_TE as PrismaIngredient_TE,
  Prisma,
  IngredientFunctionType
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

export type IngredientFilter = {
  code?: string
  internalName?: string
  commercialName?: string
  saleDenomination?: string
  functionalGroupId?: string
  ingredientFunction?: IngredientFunctionType
  manufacturerId?: string
  supplierId?: string
  technicalSourceId?: string
  systemState?: SystemState
}

export abstract class IngredientRepository {
  abstract findById(id: string, ctx: RequestContext): Promise<Ingredient_TE | null>
  abstract findAll(
    filter: IngredientFilter,
    ctx: RequestContext
  ): Promise<Ingredient_TE[]>
  abstract save(
    ingredient: Ingredient_TE,
    ctx: RequestContext
  ): Promise<Ingredient_TE>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaIngredient_TERepository implements IngredientRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, ctx: RequestContext): Promise<Ingredient_TE | null> {
    const where: Prisma.Ingredient_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const prismaIngredient = await this.prisma.ingredient_TE.findUnique({ where })
    if (!prismaIngredient) return null
    if (
      prismaIngredient &&
      effectiveTenantId &&
      prismaIngredient.systemState === SystemState.DELETED
    ) {
      return null
    }
    return PrismaIngredient_TEMapper.toDomain(prismaIngredient)
  }

  async findAll(
    filter: IngredientFilter,
    ctx: RequestContext
  ): Promise<Ingredient_TE[]> {
    const where: Prisma.Ingredient_TEWhereInput = {
      ...(filter.code && {
        code: { contains: filter.code, mode: 'insensitive' }
      }),
      ...(filter.internalName && {
        internalName: { contains: filter.internalName, mode: 'insensitive' }
      }),
      ...(filter.commercialName && {
        commercialName: { contains: filter.commercialName, mode: 'insensitive' }
      }),
      ...(filter.saleDenomination && {
        saleDenomination: {
          contains: filter.saleDenomination,
          mode: 'insensitive'
        }
      }),
      ...(filter.functionalGroupId && {
        functionalGroupId: filter.functionalGroupId
      }),
      ...(filter.ingredientFunction && {
        ingredientFunction: filter.ingredientFunction
      }),
      ...(filter.manufacturerId && { manufacturerId: filter.manufacturerId }),
      ...(filter.supplierId && { supplierId: filter.supplierId }),
      ...(filter.technicalSourceId && {
        technicalSourceId: filter.technicalSourceId
      }),
      ...(filter.systemState && { systemState: filter.systemState })
    }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    if (effectiveTenantId) {
      where.systemState = { not: SystemState.DELETED }
    }
    const prismaIngredients = await this.prisma.ingredient_TE.findMany({
      where,
      orderBy: { internalName: 'asc' }
    })
    return prismaIngredients.map((ingredient) =>
      PrismaIngredient_TEMapper.toDomain(ingredient)
    )
  }

  async save(ingredient: Ingredient_TE, ctx: RequestContext): Promise<Ingredient_TE> {
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId && ingredient.tenantId !== effectiveTenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    const id = ingredient.id.value
    const prismaIngredient = PrismaIngredient_TEMapper.toPersistence(ingredient)
    await this.prisma.ingredient_TE.upsert({
      where: { id },
      update: prismaIngredient,
      create: prismaIngredient
    })
    return ingredient
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.Ingredient_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    await this.prisma.ingredient_TE.update({
      where,
      data: { systemState: SystemState.DELETED, updatedAt: new Date() }
    })
  }
}

class PrismaIngredient_TEMapper {
  static toDomain(prismaIngredient: PrismaIngredient_TE): Ingredient_TE {
    const systemState =
      SystemState[prismaIngredient.systemState as keyof typeof SystemState]
    if (!systemState) {
      throw new Error(
        `Invalid systemState value: ${prismaIngredient.systemState}`
      )
    }
    const ingredientFunction = prismaIngredient.ingredientFunction
    return Ingredient_TE.rehydrate({
      id: Id.from(prismaIngredient.id),
      createdAt: prismaIngredient.createdAt,
      updatedAt: prismaIngredient.updatedAt,
      systemState,
      tenantId: prismaIngredient.tenantId,
      code: prismaIngredient.code,
      externalCode: prismaIngredient.externalCode,
      internalName: prismaIngredient.internalName,
      commercialName: prismaIngredient.commercialName,
      saleDenomination: prismaIngredient.saleDenomination,
      functionalGroupId: prismaIngredient.functionalGroupId,
      ingredientFunction,
      notes: prismaIngredient.notes,
      manufacturerId: prismaIngredient.manufacturerId,
      supplierId: prismaIngredient.supplierId,
      technicalSourceId: prismaIngredient.technicalSourceId,
      usageIndication: prismaIngredient.usageIndication,
      ingredientsListDesc: prismaIngredient.ingredientsListDesc,

      // Regulatory Profile
      hasRtiqPiq: prismaIngredient.hasRtiqPiq,
      gmoIngredient: prismaIngredient.gmoIngredient,
      gmoDonorSpecies: prismaIngredient.gmoDonorSpecies,
      gmoPercentage: prismaIngredient.gmoPercentage?.toNumber() ?? null,
      irradiatedIngredient: prismaIngredient.irradiatedIngredient,
      flavorOriginType: prismaIngredient.flavorOriginType,
      colorantOriginType: prismaIngredient.colorantOriginType,

      // Labeling Profile
      containsAddedSugars: prismaIngredient.containsAddedSugars,
      containsIngredientWithAddedSugars:
        prismaIngredient.containsIngredientWithAddedSugars,
      containsNaturallyOccurringSugarSubstitutes:
        prismaIngredient.containsNaturallyOccurringSugarSubstitutes,
      usesProcessingThatIncreasesSugars:
        prismaIngredient.usesProcessingThatIncreasesSugars,
      containsAddedFatsOrOils: prismaIngredient.containsAddedFatsOrOils,
      containsButterOrMargarine: prismaIngredient.containsButterOrMargarine,
      containsDairyCream: prismaIngredient.containsDairyCream,
      containsIngredientsWithFatsOrCream:
        prismaIngredient.containsIngredientsWithFatsOrCream,

      // Technical Profile
      pac: prismaIngredient.pac?.toNumber() ?? null,
      pod: prismaIngredient.pod?.toNumber() ?? null,
      totalSolids: prismaIngredient.totalSolids?.toNumber() ?? null,
      ashContent: prismaIngredient.ashContent?.toNumber() ?? null
    })
  }

  static toPersistence(
    ingredient: Ingredient_TE
  ): Prisma.Ingredient_TEUncheckedCreateInput {
    return {
      id: ingredient.id.value,
      createdAt: ingredient.createdAt,
      updatedAt: ingredient.updatedAt,
      systemState: ingredient.systemState,
      tenantId: ingredient.tenantId,
      code: ingredient.code,
      externalCode: ingredient.externalCode,
      internalName: ingredient.internalName,
      commercialName: ingredient.commercialName,
      saleDenomination: ingredient.saleDenomination,
      functionalGroupId: ingredient.functionalGroupId,
      ingredientFunction: ingredient.ingredientFunction,
      notes: ingredient.notes,
      manufacturerId: ingredient.manufacturerId,
      supplierId: ingredient.supplierId,
      technicalSourceId: ingredient.technicalSourceId,
      usageIndication: ingredient.usageIndication,
      ingredientsListDesc: ingredient.ingredientsListDesc,

      // Regulatory Profile
      hasRtiqPiq: ingredient.hasRtiqPiq,
      gmoIngredient: ingredient.gmoIngredient,
      gmoDonorSpecies: ingredient.gmoDonorSpecies,
      gmoPercentage: ingredient.gmoPercentage,
      irradiatedIngredient: ingredient.irradiatedIngredient,
      flavorOriginType: ingredient.flavorOriginType,
      colorantOriginType: ingredient.colorantOriginType,

      // Labeling Profile
      containsAddedSugars: ingredient.containsAddedSugars,
      containsIngredientWithAddedSugars:
        ingredient.containsIngredientWithAddedSugars,
      containsNaturallyOccurringSugarSubstitutes:
        ingredient.containsNaturallyOccurringSugarSubstitutes,
      usesProcessingThatIncreasesSugars:
        ingredient.usesProcessingThatIncreasesSugars,
      containsAddedFatsOrOils: ingredient.containsAddedFatsOrOils,
      containsButterOrMargarine: ingredient.containsButterOrMargarine,
      containsDairyCream: ingredient.containsDairyCream,
      containsIngredientsWithFatsOrCream:
        ingredient.containsIngredientsWithFatsOrCream,

      // Technical Profile
      pac: ingredient.pac,
      pod: ingredient.pod,
      totalSolids: ingredient.totalSolids,
      ashContent: ingredient.ashContent
    }
  }
}
