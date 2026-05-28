import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { IngredientTechnicalProfile } from '@ingredients/ingredient-technical-profile.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { Id } from '@shared/value-objects'
import { IngredientTechnicalProfile as PrismaIngredientTechnicalProfile, Prisma } from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'

export type IngredientTechnicalProfileFilter = {
  systemState?: SystemState
}

export abstract class IngredientTechnicalProfileRepository {
  abstract findById(id: string, ctx: RequestContext): Promise<IngredientTechnicalProfile | null>
  abstract findByIngredientId(ingredientId: string, ctx: RequestContext): Promise<IngredientTechnicalProfile | null>
  abstract findAll(filter: IngredientTechnicalProfileFilter, ctx: RequestContext): Promise<IngredientTechnicalProfile[]>
  abstract save(profile: IngredientTechnicalProfile, ctx: RequestContext): Promise<IngredientTechnicalProfile>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaIngredientTechnicalProfileRepository implements IngredientTechnicalProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, ctx: RequestContext): Promise<IngredientTechnicalProfile | null> {
    const where: Prisma.IngredientTechnicalProfileWhereUniqueInput = { id }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    const prismaProfile = await this.prisma.ingredientTechnicalProfile.findUnique({ where })
    if (!prismaProfile) return null
    if (prismaProfile && ctx.scope === UserScope.TENANT && prismaProfile.systemState === SystemState.HIDDEN) {
      return null
    }
    return PrismaIngredientTechnicalProfileMapper.toDomain(prismaProfile)
  }

  async findByIngredientId(ingredientId: string, ctx: RequestContext): Promise<IngredientTechnicalProfile | null> {
    const where: Prisma.IngredientTechnicalProfileWhereUniqueInput = { ingredientId }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    const prismaProfile = await this.prisma.ingredientTechnicalProfile.findUnique({ where })
    if (!prismaProfile) return null
    if (ctx.scope === UserScope.TENANT && prismaProfile.systemState === SystemState.HIDDEN) {
      return null
    }
    return PrismaIngredientTechnicalProfileMapper.toDomain(prismaProfile)
  }

  async findAll(filter: IngredientTechnicalProfileFilter, ctx: RequestContext): Promise<IngredientTechnicalProfile[]> {
    const where: Prisma.IngredientTechnicalProfileWhereInput = {
      ...(filter.systemState && { systemState: filter.systemState })
    }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    if (ctx.scope === UserScope.TENANT) {
      where.systemState = { not: SystemState.HIDDEN }
    }
    const prismaProfiles = await this.prisma.ingredientTechnicalProfile.findMany({ where })
    return prismaProfiles.map((p) => PrismaIngredientTechnicalProfileMapper.toDomain(p))
  }

  async save(profile: IngredientTechnicalProfile, ctx: RequestContext): Promise<IngredientTechnicalProfile> {
    if (ctx.scope === UserScope.TENANT && profile.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    const id = profile.id.value
    const prismaProfile = PrismaIngredientTechnicalProfileMapper.toPersistence(profile)
    await this.prisma.ingredientTechnicalProfile.upsert({
      where: { id },
      update: prismaProfile,
      create: prismaProfile
    })
    return profile
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.IngredientTechnicalProfileWhereUniqueInput = { id }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    await this.prisma.ingredientTechnicalProfile.update({
      where,
      data: { systemState: SystemState.HIDDEN, updatedAt: new Date() }
    })
  }
}

class PrismaIngredientTechnicalProfileMapper {
  static toDomain(p: PrismaIngredientTechnicalProfile): IngredientTechnicalProfile {
    const systemState = SystemState[p.systemState as keyof typeof SystemState]
    if (!systemState) {
      throw new Error(`Invalid systemState value: ${p.systemState}`)
    }
    return IngredientTechnicalProfile.rehydrate({
      id: Id.from(p.id),
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      systemState,
      tenantId: p.tenantId,
      ingredientId: p.ingredientId,
      pac: p.pac?.toNumber() ?? null,
      pod: p.pod?.toNumber() ?? null,
      totalSolids: p.totalSolids?.toNumber() ?? null,
      ashContent: p.ashContent?.toNumber() ?? null
    })
  }

  static toPersistence(profile: IngredientTechnicalProfile): Prisma.IngredientTechnicalProfileUncheckedCreateInput {
    return {
      id: profile.id.value,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      systemState: profile.systemState,
      tenantId: profile.tenantId,
      ingredientId: profile.ingredientId,
      pac: profile.pac !== null ? new Prisma.Decimal(profile.pac) : null,
      pod: profile.pod !== null ? new Prisma.Decimal(profile.pod) : null,
      totalSolids: profile.totalSolids !== null ? new Prisma.Decimal(profile.totalSolids) : null,
      ashContent: profile.ashContent !== null ? new Prisma.Decimal(profile.ashContent) : null
    }
  }
}
