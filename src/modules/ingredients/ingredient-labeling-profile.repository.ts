import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { IngredientLabelingProfile } from '@ingredients/ingredient-labeling-profile.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { Id } from '@shared/value-objects'
import { IngredientLabelingProfile as PrismaIngredientLabelingProfile, Prisma } from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'

export type IngredientLabelingProfileFilter = {
  containsAddedSugars?: boolean
  containsAddedFatsOrOils?: boolean
  containsButterOrMargarine?: boolean
  containsDairyCream?: boolean
  systemState?: SystemState
}

export abstract class IngredientLabelingProfileRepository {
  abstract findById(id: string, ctx: RequestContext): Promise<IngredientLabelingProfile | null>
  abstract findByIngredientId(ingredientId: string, ctx: RequestContext): Promise<IngredientLabelingProfile | null>
  abstract findAll(filter: IngredientLabelingProfileFilter, ctx: RequestContext): Promise<IngredientLabelingProfile[]>
  abstract save(profile: IngredientLabelingProfile, ctx: RequestContext): Promise<IngredientLabelingProfile>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaIngredientLabelingProfileRepository implements IngredientLabelingProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, ctx: RequestContext): Promise<IngredientLabelingProfile | null> {
    const where: Prisma.IngredientLabelingProfileWhereUniqueInput = { id }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    const prismaProfile = await this.prisma.ingredientLabelingProfile.findUnique({ where })
    if (!prismaProfile) return null
    return PrismaIngredientLabelingProfileMapper.toDomain(prismaProfile)
  }

  async findByIngredientId(ingredientId: string, ctx: RequestContext): Promise<IngredientLabelingProfile | null> {
    const where: Prisma.IngredientLabelingProfileWhereUniqueInput = { ingredientId }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    const prismaProfile = await this.prisma.ingredientLabelingProfile.findUnique({ where })
    if (!prismaProfile) return null
    return PrismaIngredientLabelingProfileMapper.toDomain(prismaProfile)
  }

  async findAll(filter: IngredientLabelingProfileFilter, ctx: RequestContext): Promise<IngredientLabelingProfile[]> {
    const where: Prisma.IngredientLabelingProfileWhereInput = {
      systemState: filter.systemState ?? SystemState.ACTIVE,
      ...(filter.containsAddedSugars !== undefined && { containsAddedSugars: filter.containsAddedSugars }),
      ...(filter.containsAddedFatsOrOils !== undefined && { containsAddedFatsOrOils: filter.containsAddedFatsOrOils }),
      ...(filter.containsButterOrMargarine !== undefined && { containsButterOrMargarine: filter.containsButterOrMargarine }),
      ...(filter.containsDairyCream !== undefined && { containsDairyCream: filter.containsDairyCream })
    }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    const prismaProfiles = await this.prisma.ingredientLabelingProfile.findMany({ where })
    return prismaProfiles.map((p) => PrismaIngredientLabelingProfileMapper.toDomain(p))
  }

  async save(profile: IngredientLabelingProfile, ctx: RequestContext): Promise<IngredientLabelingProfile> {
    if (ctx.scope === UserScope.TENANT && profile.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    const id = profile.id.value
    const prismaProfile = PrismaIngredientLabelingProfileMapper.toPersistence(profile)
    await this.prisma.ingredientLabelingProfile.upsert({
      where: { id },
      update: prismaProfile,
      create: prismaProfile
    })
    return profile
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.IngredientLabelingProfileWhereUniqueInput = { id }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    await this.prisma.ingredientLabelingProfile.update({
      where,
      data: { systemState: SystemState.HIDDEN, updatedAt: new Date() }
    })
  }
}

class PrismaIngredientLabelingProfileMapper {
  static toDomain(p: PrismaIngredientLabelingProfile): IngredientLabelingProfile {
    const systemState = SystemState[p.systemState as keyof typeof SystemState]
    if (!systemState) {
      throw new Error(`Invalid systemState value: ${p.systemState}`)
    }
    return IngredientLabelingProfile.rehydrate({
      id: Id.from(p.id),
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      systemState,
      tenantId: p.tenantId,
      ingredientId: p.ingredientId,
      containsAddedSugars: p.containsAddedSugars,
      containsIngredientWithAddedSugars: p.containsIngredientWithAddedSugars,
      containsNaturallyOccurringSugarSubstitutes: p.containsNaturallyOccurringSugarSubstitutes,
      usesProcessingThatIncreasesSugars: p.usesProcessingThatIncreasesSugars,
      containsAddedFatsOrOils: p.containsAddedFatsOrOils,
      containsButterOrMargarine: p.containsButterOrMargarine,
      containsDairyCream: p.containsDairyCream,
      containsIngredientsWithFatsOrCream: p.containsIngredientsWithFatsOrCream
    })
  }

  static toPersistence(profile: IngredientLabelingProfile): Prisma.IngredientLabelingProfileUncheckedCreateInput {
    return {
      id: profile.id.value,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      systemState: profile.systemState,
      tenantId: profile.tenantId,
      ingredientId: profile.ingredientId,
      containsAddedSugars: profile.containsAddedSugars,
      containsIngredientWithAddedSugars: profile.containsIngredientWithAddedSugars,
      containsNaturallyOccurringSugarSubstitutes: profile.containsNaturallyOccurringSugarSubstitutes,
      usesProcessingThatIncreasesSugars: profile.usesProcessingThatIncreasesSugars,
      containsAddedFatsOrOils: profile.containsAddedFatsOrOils,
      containsButterOrMargarine: profile.containsButterOrMargarine,
      containsDairyCream: profile.containsDairyCream,
      containsIngredientsWithFatsOrCream: profile.containsIngredientsWithFatsOrCream
    }
  }
}
