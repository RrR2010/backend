import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { TechnicalSourceType_TE } from '@ingredients/technical-source-type-te.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { Id } from '@shared/value-objects'
import {
  TechnicalSourceType_TE as PrismaTechnicalSourceType_TE,
  Prisma
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

export type TechnicalSourceType_TEFilter = {
  name?: string
  systemState?: SystemState
}

export abstract class TechnicalSourceType_TE_Repository {
  abstract findById(
    id: string,
    ctx: RequestContext
  ): Promise<TechnicalSourceType_TE | null>
  abstract findAll(
    filter: TechnicalSourceType_TEFilter,
    ctx: RequestContext
  ): Promise<TechnicalSourceType_TE[]>
  abstract save(
    source: TechnicalSourceType_TE,
    ctx: RequestContext
  ): Promise<TechnicalSourceType_TE>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaTechnicalSourceType_TE_Repository implements TechnicalSourceType_TE_Repository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<TechnicalSourceType_TE | null> {
    const where: Prisma.TechnicalSourceType_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const prismaSource = await this.prisma.technicalSourceType_TE.findUnique({
      where
    })
    if (!prismaSource) return null
    if (
      prismaSource &&
      effectiveTenantId &&
      prismaSource.systemState === SystemState.DELETED
    ) {
      return null
    }
    return PrismaTechnicalSourceType_TEMapper.toDomain(prismaSource)
  }

  async findAll(
    filter: TechnicalSourceType_TEFilter,
    ctx: RequestContext
  ): Promise<TechnicalSourceType_TE[]> {
    const where: Prisma.TechnicalSourceType_TEWhereInput = {
      ...(filter.name && {
        name: { contains: filter.name, mode: 'insensitive' }
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
    const prismaSources = await this.prisma.technicalSourceType_TE.findMany({
      where,
      orderBy: { name: 'asc' }
    })
    return prismaSources.map((source) =>
      PrismaTechnicalSourceType_TEMapper.toDomain(source)
    )
  }

  async save(
    source: TechnicalSourceType_TE,
    ctx: RequestContext
  ): Promise<TechnicalSourceType_TE> {
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId && source.tenantId !== effectiveTenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    const id = source.id.value
    const prismaSource =
      PrismaTechnicalSourceType_TEMapper.toPersistence(source)
    await this.prisma.technicalSourceType_TE.upsert({
      where: { id },
      update: prismaSource,
      create: prismaSource
    })
    return source
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.TechnicalSourceType_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    await this.prisma.technicalSourceType_TE.update({
      where,
      data: { systemState: SystemState.DELETED, updatedAt: new Date() }
    })
  }
}

class PrismaTechnicalSourceType_TEMapper {
  static toDomain(
    prismaSource: PrismaTechnicalSourceType_TE
  ): TechnicalSourceType_TE {
    const systemState =
      SystemState[prismaSource.systemState as keyof typeof SystemState]
    if (!systemState) {
      throw new Error(`Invalid systemState value: ${prismaSource.systemState}`)
    }
    return TechnicalSourceType_TE.rehydrate({
      id: Id.from(prismaSource.id),
      createdAt: prismaSource.createdAt,
      updatedAt: prismaSource.updatedAt,
      systemState,
      tenantId: prismaSource.tenantId,
      name: prismaSource.name,
      description: prismaSource.description
    })
  }

  static toPersistence(
    source: TechnicalSourceType_TE
  ): Prisma.TechnicalSourceType_TEUncheckedCreateInput {
    return {
      id: source.id.value,
      createdAt: source.createdAt,
      updatedAt: source.updatedAt,
      systemState: source.systemState,
      tenantId: source.tenantId,
      name: source.name,
      description: source.description
    }
  }
}
