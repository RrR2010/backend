import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { IngredientRegulatoryProfile } from '@ingredients/ingredient-regulatory-profile.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { Id } from '@shared/value-objects'
import { IngredientRegulatoryProfile as PrismaIngredientRegulatoryProfile, Prisma, FlavorOriginType, ColorantOriginType } from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'

export type IngredientRegulatoryProfileFilter = {
  ingredientId?: string
  hasRtiq?: boolean
  isGmo?: boolean
  containsLactose?: boolean
  containsGluten?: boolean
  containsAspartame?: boolean
  systemState?: SystemState
}

export abstract class IngredientRegulatoryProfileRepository {
  abstract findById(id: string, ctx: RequestContext): Promise<IngredientRegulatoryProfile | null>
  abstract findByIngredientId(ingredientId: string, ctx: RequestContext): Promise<IngredientRegulatoryProfile | null>
  abstract findAll(filter: IngredientRegulatoryProfileFilter, ctx: RequestContext): Promise<IngredientRegulatoryProfile[]>
  abstract save(profile: IngredientRegulatoryProfile, ctx: RequestContext): Promise<IngredientRegulatoryProfile>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaIngredientRegulatoryProfileRepository implements IngredientRegulatoryProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, ctx: RequestContext): Promise<IngredientRegulatoryProfile | null> {
    const where: Prisma.IngredientRegulatoryProfileWhereUniqueInput = { id }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    const prismaProfile = await this.prisma.ingredientRegulatoryProfile.findUnique({ where })
    if (!prismaProfile) return null
    return PrismaIngredientRegulatoryProfileMapper.toDomain(prismaProfile)
  }

  async findByIngredientId(ingredientId: string, ctx: RequestContext): Promise<IngredientRegulatoryProfile | null> {
    const where: Prisma.IngredientRegulatoryProfileWhereUniqueInput = { ingredientId }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    const prismaProfile = await this.prisma.ingredientRegulatoryProfile.findUnique({ where })
    if (!prismaProfile) return null
    return PrismaIngredientRegulatoryProfileMapper.toDomain(prismaProfile)
  }

  async findAll(filter: IngredientRegulatoryProfileFilter, ctx: RequestContext): Promise<IngredientRegulatoryProfile[]> {
    const where: Prisma.IngredientRegulatoryProfileWhereInput = {
      systemState: filter.systemState ?? SystemState.ACTIVE,
      ...(filter.hasRtiq !== undefined && { hasRtiq: filter.hasRtiq }),
      ...(filter.isGmo !== undefined && { isGmo: filter.isGmo }),
      ...(filter.containsLactose !== undefined && { containsLactose: filter.containsLactose }),
      ...(filter.containsGluten !== undefined && { containsGluten: filter.containsGluten }),
      ...(filter.containsAspartame !== undefined && { containsAspartame: filter.containsAspartame }),
      ...(filter.ingredientId && { ingredientId: filter.ingredientId })
    }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    const prismaProfiles = await this.prisma.ingredientRegulatoryProfile.findMany({ where })
    return prismaProfiles.map((p) => PrismaIngredientRegulatoryProfileMapper.toDomain(p))
  }

  async save(profile: IngredientRegulatoryProfile, ctx: RequestContext): Promise<IngredientRegulatoryProfile> {
    if (ctx.scope === UserScope.TENANT && profile.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    const id = profile.id.value
    const prismaProfile = PrismaIngredientRegulatoryProfileMapper.toPersistence(profile)
    await this.prisma.ingredientRegulatoryProfile.upsert({
      where: { id },
      update: prismaProfile,
      create: prismaProfile
    })
    return profile
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.IngredientRegulatoryProfileWhereUniqueInput = { id }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    await this.prisma.ingredientRegulatoryProfile.update({
      where,
      data: { systemState: SystemState.HIDDEN, updatedAt: new Date() }
    })
  }
}

class PrismaIngredientRegulatoryProfileMapper {
  static toDomain(p: PrismaIngredientRegulatoryProfile): IngredientRegulatoryProfile {
    const systemState = SystemState[p.systemState as keyof typeof SystemState]
    if (!systemState) {
      throw new Error(`Invalid systemState value: ${p.systemState}`)
    }
    return IngredientRegulatoryProfile.rehydrate({
      id: Id.from(p.id),
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      systemState,
      tenantId: p.tenantId,
      ingredientId: p.ingredientId,
      hasRtiq: p.hasRtiq,
      isGmo: p.isGmo,
      gmoIngredient: p.gmoIngredient,
      gmoDonorSpecies: p.gmoDonorSpecies,
      gmoPercentage: p.gmoPercentage?.toNumber() ?? null,
      isIrradiated: p.isIrradiated,
      irradiatedIngredient: p.irradiatedIngredient,
      containsLactose: p.containsLactose,
      containsGluten: p.containsGluten,
      containsAspartame: p.containsAspartame,
      flavorOriginType: p.flavorOriginType as FlavorOriginType | null,
      colorantOriginType: p.colorantOriginType as ColorantOriginType | null
    })
  }

  static toPersistence(profile: IngredientRegulatoryProfile): Prisma.IngredientRegulatoryProfileUncheckedCreateInput {
    return {
      id: profile.id.value,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      systemState: profile.systemState,
      tenantId: profile.tenantId,
      ingredientId: profile.ingredientId,
      hasRtiq: profile.hasRtiq,
      isGmo: profile.isGmo,
      gmoIngredient: profile.gmoIngredient,
      gmoDonorSpecies: profile.gmoDonorSpecies,
      gmoPercentage: profile.gmoPercentage !== null ? new Prisma.Decimal(profile.gmoPercentage) : null,
      isIrradiated: profile.isIrradiated,
      irradiatedIngredient: profile.irradiatedIngredient,
      containsLactose: profile.containsLactose,
      containsGluten: profile.containsGluten,
      containsAspartame: profile.containsAspartame,
      flavorOriginType: profile.flavorOriginType,
      colorantOriginType: profile.colorantOriginType
    }
  }
}
