import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { TechnicalInfoSource } from '@ingredients/technical-info-source.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { Id } from '@shared/value-objects'
import { TechnicalInfoSource as PrismaTechnicalInfoSource, Prisma, TechnicalInfoSourceType } from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'

export type TechnicalInfoSourceFilter = {
  referenceName?: string
  sourceType?: TechnicalInfoSourceType
  systemState?: SystemState
}

export abstract class TechnicalInfoSourceRepository {
  abstract findById(id: string, ctx: RequestContext): Promise<TechnicalInfoSource | null>
  abstract findAll(filter: TechnicalInfoSourceFilter, ctx: RequestContext): Promise<TechnicalInfoSource[]>
  abstract save(source: TechnicalInfoSource, ctx: RequestContext): Promise<TechnicalInfoSource>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaTechnicalInfoSourceRepository implements TechnicalInfoSourceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, ctx: RequestContext): Promise<TechnicalInfoSource | null> {
    const where: Prisma.TechnicalInfoSourceWhereUniqueInput = { id }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    const prismaSource = await this.prisma.technicalInfoSource.findUnique({ where })
    if (!prismaSource) return null
    if (prismaSource && ctx.scope === UserScope.TENANT && prismaSource.systemState === SystemState.HIDDEN) {
      return null
    }
    return PrismaTechnicalInfoSourceMapper.toDomain(prismaSource)
  }

  async findAll(filter: TechnicalInfoSourceFilter, ctx: RequestContext): Promise<TechnicalInfoSource[]> {
    const where: Prisma.TechnicalInfoSourceWhereInput = {
      ...(filter.referenceName && { referenceName: { contains: filter.referenceName, mode: 'insensitive' } }),
      ...(filter.sourceType && { sourceType: filter.sourceType }),
      ...(filter.systemState && { systemState: filter.systemState })
    }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    if (ctx.scope === UserScope.TENANT) {
      where.systemState = { not: SystemState.HIDDEN }
    }
    const prismaSources = await this.prisma.technicalInfoSource.findMany({
      where,
      orderBy: { referenceName: 'asc' }
    })
    return prismaSources.map((source) => PrismaTechnicalInfoSourceMapper.toDomain(source))
  }

  async save(source: TechnicalInfoSource, ctx: RequestContext): Promise<TechnicalInfoSource> {
    if (ctx.scope === UserScope.TENANT && source.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    const id = source.id.value
    const prismaSource = PrismaTechnicalInfoSourceMapper.toPersistence(source)
    await this.prisma.technicalInfoSource.upsert({
      where: { id },
      update: prismaSource,
      create: prismaSource
    })
    return source
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.TechnicalInfoSourceWhereUniqueInput = { id }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    await this.prisma.technicalInfoSource.update({
      where,
      data: { systemState: SystemState.HIDDEN, updatedAt: new Date() }
    })
  }
}

class PrismaTechnicalInfoSourceMapper {
  static toDomain(prismaSource: PrismaTechnicalInfoSource): TechnicalInfoSource {
    const systemState = SystemState[prismaSource.systemState as keyof typeof SystemState]
    if (!systemState) {
      throw new Error(`Invalid systemState value: ${prismaSource.systemState}`)
    }
    return TechnicalInfoSource.rehydrate({
      id: Id.from(prismaSource.id),
      createdAt: prismaSource.createdAt,
      updatedAt: prismaSource.updatedAt,
      systemState,
      tenantId: prismaSource.tenantId,
      sourceType: prismaSource.sourceType,
      referenceName: prismaSource.referenceName,
      url: prismaSource.url,
      documentRef: prismaSource.documentRef
    })
  }

  static toPersistence(source: TechnicalInfoSource): Prisma.TechnicalInfoSourceUncheckedCreateInput {
    return {
      id: source.id.value,
      createdAt: source.createdAt,
      updatedAt: source.updatedAt,
      systemState: source.systemState,
      tenantId: source.tenantId,
      sourceType: source.sourceType,
      referenceName: source.referenceName,
      url: source.url,
      documentRef: source.documentRef
    }
  }
}
