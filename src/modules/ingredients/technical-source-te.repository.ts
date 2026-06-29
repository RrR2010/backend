import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { TechnicalSource_TE } from '@ingredients/technical-source-te.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { Id } from '@shared/value-objects'
import {
  TechnicalSource_TE as PrismaTechnicalSource_TE,
  Prisma
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

export type TechnicalSource_TEFilter = {
  referenceName?: string
  systemState?: SystemState
}

export abstract class TechnicalSource_TE_Repository {
  abstract findById(
    id: string,
    ctx: RequestContext
  ): Promise<TechnicalSource_TE | null>
  abstract findAll(
    filter: TechnicalSource_TEFilter,
    ctx: RequestContext
  ): Promise<TechnicalSource_TE[]>
  abstract save(
    source: TechnicalSource_TE,
    ctx: RequestContext
  ): Promise<TechnicalSource_TE>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaTechnicalSource_TE_Repository
  implements TechnicalSource_TE_Repository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<TechnicalSource_TE | null> {
    const where: Prisma.TechnicalSource_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const prismaSource = await this.prisma.technicalSource_TE.findUnique({
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
    return PrismaTechnicalSource_TEMapper.toDomain(prismaSource)
  }

  async findAll(
    filter: TechnicalSource_TEFilter,
    ctx: RequestContext
  ): Promise<TechnicalSource_TE[]> {
    const where: Prisma.TechnicalSource_TEWhereInput = {
      ...(filter.referenceName && {
        referenceName: { contains: filter.referenceName, mode: 'insensitive' }
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
    const prismaSources = await this.prisma.technicalSource_TE.findMany({
      where,
      orderBy: { referenceName: 'asc' }
    })
    return prismaSources.map((source) =>
      PrismaTechnicalSource_TEMapper.toDomain(source)
    )
  }

  async save(
    source: TechnicalSource_TE,
    ctx: RequestContext
  ): Promise<TechnicalSource_TE> {
    if (ctx.scope === UserScope.TENANT && source.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    const id = source.id.value
    const prismaSource = PrismaTechnicalSource_TEMapper.toPersistence(source)
    await this.prisma.technicalSource_TE.upsert({
      where: { id },
      update: prismaSource,
      create: prismaSource
    })
    return source
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.TechnicalSource_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    await this.prisma.technicalSource_TE.update({
      where,
      data: { systemState: SystemState.DELETED, updatedAt: new Date() }
    })
  }
}

class PrismaTechnicalSource_TEMapper {
  static toDomain(
    prismaSource: PrismaTechnicalSource_TE
  ): TechnicalSource_TE {
    const systemState =
      SystemState[prismaSource.systemState as keyof typeof SystemState]
    if (!systemState) {
      throw new Error(`Invalid systemState value: ${prismaSource.systemState}`)
    }
    return TechnicalSource_TE.rehydrate({
      id: Id.from(prismaSource.id),
      createdAt: prismaSource.createdAt,
      updatedAt: prismaSource.updatedAt,
      systemState,
      tenantId: prismaSource.tenantId,
      sourceTypePlId: prismaSource.sourceTypePlId,
      sourceTypeTeId: prismaSource.sourceTypeTeId,
      referenceName: prismaSource.referenceName,
      url: prismaSource.url,
      documentRef: prismaSource.documentRef,
      notes: prismaSource.notes
    })
  }

  static toPersistence(
    source: TechnicalSource_TE
  ): Prisma.TechnicalSource_TEUncheckedCreateInput {
    return {
      id: source.id.value,
      createdAt: source.createdAt,
      updatedAt: source.updatedAt,
      systemState: source.systemState,
      tenantId: source.tenantId,
      sourceTypePlId: source.sourceTypePlId,
      sourceTypeTeId: source.sourceTypeTeId,
      referenceName: source.referenceName,
      url: source.url,
      documentRef: source.documentRef,
      notes: source.notes
    }
  }
}
