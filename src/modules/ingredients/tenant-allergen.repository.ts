import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { TenantAllergen } from '@ingredients/tenant-allergen.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { Id } from '@shared/value-objects'
import { IngredientAllergen_TE as PrismaTenantAllergen, Prisma } from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

// TODO (T-044): TenantAllergen model removed from Prisma.
// This repository is temporarily backed by IngredientAllergen_TE until T-046
// replaces TenantAllergenRepository with IngredientAllergen_TE repository.

export type TenantAllergenFilter = {
  name?: string
  category?: string
  isActive?: boolean
  systemState?: SystemState
}

export abstract class TenantAllergenRepository {
  abstract findById(
    id: string,
    ctx: RequestContext
  ): Promise<TenantAllergen | null>
  abstract findAll(
    filter: TenantAllergenFilter,
    ctx: RequestContext
  ): Promise<TenantAllergen[]>
  abstract save(
    allergen: TenantAllergen,
    ctx: RequestContext
  ): Promise<TenantAllergen>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaTenantAllergenRepository implements TenantAllergenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<TenantAllergen | null> {
    const where: Prisma.IngredientAllergen_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const prismaAllergen = await this.prisma.ingredientAllergen_TE.findUnique({
      where
    })
    if (!prismaAllergen) return null
    return PrismaTenantAllergenMapper.toDomain(prismaAllergen as any)
  }

  async findAll(
    filter: TenantAllergenFilter,
    ctx: RequestContext
  ): Promise<TenantAllergen[]> {
    const where: Prisma.IngredientAllergen_TEWhereInput = {}
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const prismaAllergens = await this.prisma.ingredientAllergen_TE.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    })
    return prismaAllergens.map((allergen) =>
      PrismaTenantAllergenMapper.toDomain(allergen as any)
    )
  }

  async save(
    allergen: TenantAllergen,
    ctx: RequestContext
  ): Promise<TenantAllergen> {
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId && allergen.tenantId !== effectiveTenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    const id = allergen.id.value
    const prismaAllergen = PrismaTenantAllergenMapper.toPersistence(allergen)
    await this.prisma.ingredientAllergen_TE.upsert({
      where: { id },
      update: prismaAllergen,
      create: prismaAllergen
    })
    return allergen
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.IngredientAllergen_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    await this.prisma.ingredientAllergen_TE.delete({ where })
  }
}

class PrismaTenantAllergenMapper {
  static toDomain(prismaAllergen: any): TenantAllergen {
    return TenantAllergen.rehydrate({
      id: Id.from(prismaAllergen.id),
      createdAt: prismaAllergen.createdAt,
      updatedAt: prismaAllergen.updatedAt,
      systemState: SystemState.ACTIVE,
      tenantId: prismaAllergen.tenantId,
      name: '',
      category: null,
      regulatoryRef: null,
      sortOrder: 0,
      isActive: true
    })
  }

  static toPersistence(
    allergen: TenantAllergen
  ): Prisma.IngredientAllergen_TEUncheckedCreateInput {
    return {
      id: allergen.id.value,
      createdAt: allergen.createdAt,
      updatedAt: allergen.updatedAt,
      tenantId: allergen.tenantId,
      ingredientId: '', // TODO: map correctly in T-046
      allergenId: '',   // TODO: map correctly in T-046
      relationType: 'CONTAINS', // TODO: map correctly in T-046
    }
  }
}
