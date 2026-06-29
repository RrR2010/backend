import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { IngredientCost_TE } from '@ingredients/ingredient-cost-te.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { Id } from '@shared/value-objects'
import {
  IngredientCost_TE as PrismaIngredientCost_TE,
  Prisma
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

export type IngredientCostFilter = {
  ingredientId?: string
  systemState?: SystemState
}

export abstract class IngredientCost_TE_Repository {
  abstract findById(
    id: string,
    ctx: RequestContext
  ): Promise<IngredientCost_TE | null>
  abstract findAll(
    filter: IngredientCostFilter,
    ctx: RequestContext
  ): Promise<IngredientCost_TE[]>
  abstract findByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<IngredientCost_TE[]>
  abstract save(
    entity: IngredientCost_TE,
    ctx: RequestContext
  ): Promise<IngredientCost_TE>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaIngredientCost_TE_Repository
  implements IngredientCost_TE_Repository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<IngredientCost_TE | null> {
    const where: Prisma.IngredientCost_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const prismaRecord = await this.prisma.ingredientCost_TE.findUnique({
      where
    })
    if (!prismaRecord) return null
    if (
      prismaRecord &&
      effectiveTenantId &&
      prismaRecord.systemState === SystemState.DELETED
    ) {
      return null
    }
    return PrismaIngredientCost_TE_Mapper.toDomain(prismaRecord)
  }

  async findAll(
    filter: IngredientCostFilter,
    ctx: RequestContext
  ): Promise<IngredientCost_TE[]> {
    const where: Prisma.IngredientCost_TEWhereInput = {
      ...(filter.ingredientId && { ingredientId: filter.ingredientId }),
      ...(filter.systemState && { systemState: filter.systemState })
    }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    if (effectiveTenantId) {
      where.systemState = { not: SystemState.DELETED }
    }
    const prismaRecords = await this.prisma.ingredientCost_TE.findMany({
      where,
      orderBy: { effectiveDate: 'desc' }
    })
    return prismaRecords.map((record) =>
      PrismaIngredientCost_TE_Mapper.toDomain(record)
    )
  }

  async findByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<IngredientCost_TE[]> {
    const where: Prisma.IngredientCost_TEWhereInput = {
      ingredientId
    }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    if (effectiveTenantId) {
      where.systemState = { not: SystemState.DELETED }
    }
    const prismaRecords = await this.prisma.ingredientCost_TE.findMany({
      where,
      orderBy: { effectiveDate: 'desc' }
    })
    return prismaRecords.map((record) =>
      PrismaIngredientCost_TE_Mapper.toDomain(record)
    )
  }

  async save(
    entity: IngredientCost_TE,
    ctx: RequestContext
  ): Promise<IngredientCost_TE> {
    if (
      ctx.scope === UserScope.TENANT &&
      entity.tenantId !== ctx.tenantId
    ) {
      throw new ForbiddenException(
        'Cannot modify resource outside your tenant'
      )
    }
    const id = entity.id.value
    const prismaRecord = PrismaIngredientCost_TE_Mapper.toPersistence(entity)
    await this.prisma.ingredientCost_TE.upsert({
      where: { id },
      update: prismaRecord,
      create: prismaRecord
    })
    return entity
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.IngredientCost_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    await this.prisma.ingredientCost_TE.update({
      where,
      data: { systemState: SystemState.DELETED, updatedAt: new Date() }
    })
  }
}

class PrismaIngredientCost_TE_Mapper {
  static toDomain(raw: PrismaIngredientCost_TE): IngredientCost_TE {
    const systemState =
      SystemState[raw.systemState as keyof typeof SystemState]
    if (!systemState) {
      throw new Error(`Invalid systemState value: ${raw.systemState}`)
    }
    return IngredientCost_TE.rehydrate({
      id: Id.from(raw.id),
      tenantId: raw.tenantId,
      ingredientId: raw.ingredientId,
      unitPrice: raw.unitPrice.toNumber(),
      currencyCode: raw.currencyCode,
      unitOfMeasureId: raw.unitOfMeasureId,
      effectiveDate: raw.effectiveDate,
      supplierId: raw.supplierId,
      notes: raw.notes,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      systemState
    })
  }

  static toPersistence(
    entity: IngredientCost_TE
  ): Prisma.IngredientCost_TEUncheckedCreateInput {
    return {
      id: entity.id.value,
      tenantId: entity.tenantId,
      ingredientId: entity.ingredientId,
      unitPrice: new Prisma.Decimal(entity.unitPrice),
      currencyCode: entity.currencyCode,
      unitOfMeasureId: entity.unitOfMeasureId,
      effectiveDate: entity.effectiveDate,
      supplierId: entity.supplierId,
      notes: entity.notes,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      systemState: entity.systemState
    }
  }
}
