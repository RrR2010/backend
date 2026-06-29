import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { IngredientFlag_TE } from '@ingredients/ingredient-flag-te.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { Id } from '@shared/value-objects'
import {
  IngredientFlag_TE as PrismaIngredientFlag_TE,
  Prisma
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

export type IngredientFlagFilter = {
  ingredientId?: string
  flagId?: string
  flagValue?: boolean
}

export abstract class IngredientFlag_TE_Repository {
  abstract findById(
    id: string,
    ctx: RequestContext
  ): Promise<IngredientFlag_TE | null>
  abstract findAll(
    filter: IngredientFlagFilter,
    ctx: RequestContext
  ): Promise<IngredientFlag_TE[]>
  abstract findByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<IngredientFlag_TE[]>
  abstract save(
    entry: IngredientFlag_TE,
    ctx: RequestContext
  ): Promise<IngredientFlag_TE>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaIngredientFlag_TE_Repository
  implements IngredientFlag_TE_Repository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<IngredientFlag_TE | null> {
    const where: Prisma.IngredientFlag_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const prismaEntry = await this.prisma.ingredientFlag_TE.findUnique({
      where
    })
    if (!prismaEntry) return null
    if (
      prismaEntry &&
      effectiveTenantId &&
      prismaEntry.systemState === SystemState.DELETED
    ) {
      return null
    }
    return PrismaIngredientFlag_TE_Mapper.toDomain(prismaEntry)
  }

  async findAll(
    filter: IngredientFlagFilter,
    ctx: RequestContext
  ): Promise<IngredientFlag_TE[]> {
    const where: Prisma.IngredientFlag_TEWhereInput = {
      ...(filter.ingredientId && { ingredientId: filter.ingredientId }),
      ...(filter.flagId && { flagId: filter.flagId }),
      ...(filter.flagValue !== undefined && { flagValue: filter.flagValue })
    }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    if (effectiveTenantId) {
      where.systemState = { not: SystemState.DELETED }
    }
    const prismaEntries = await this.prisma.ingredientFlag_TE.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    })
    return prismaEntries.map((entry) =>
      PrismaIngredientFlag_TE_Mapper.toDomain(entry)
    )
  }

  async findByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<IngredientFlag_TE[]> {
    return this.findAll({ ingredientId }, ctx)
  }

  async save(
    entry: IngredientFlag_TE,
    ctx: RequestContext
  ): Promise<IngredientFlag_TE> {
    if (ctx.scope === UserScope.TENANT && entry.tenantId !== ctx.tenantId) {
      throw new ForbiddenException(
        'Cannot modify resource outside your tenant'
      )
    }
    const id = entry.id.value
    const prismaData = PrismaIngredientFlag_TE_Mapper.toPersistence(entry)
    await this.prisma.ingredientFlag_TE.upsert({
      where: { id },
      update: prismaData,
      create: prismaData
    })
    return entry
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.IngredientFlag_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    await this.prisma.ingredientFlag_TE.update({
      where,
      data: { systemState: SystemState.DELETED, updatedAt: new Date() }
    })
  }
}

class PrismaIngredientFlag_TE_Mapper {
  static toDomain(prismaEntry: PrismaIngredientFlag_TE): IngredientFlag_TE {
    const systemState =
      SystemState[prismaEntry.systemState as keyof typeof SystemState]
    if (!systemState) {
      throw new Error(
        `Invalid systemState value: ${prismaEntry.systemState}`
      )
    }
    return IngredientFlag_TE.rehydrate({
      id: Id.from(prismaEntry.id),
      createdAt: prismaEntry.createdAt,
      updatedAt: prismaEntry.updatedAt,
      systemState,
      tenantId: prismaEntry.tenantId,
      ingredientId: prismaEntry.ingredientId,
      flagId: prismaEntry.flagId,
      flagValue: prismaEntry.flagValue,
      notes: prismaEntry.notes
    })
  }

  static toPersistence(
    entry: IngredientFlag_TE
  ): Prisma.IngredientFlag_TEUncheckedCreateInput {
    return {
      id: entry.id.value,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      systemState: entry.systemState,
      tenantId: entry.tenantId,
      ingredientId: entry.ingredientId,
      flagId: entry.flagId,
      flagValue: entry.flagValue,
      notes: entry.notes
    }
  }
}
