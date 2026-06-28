import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { CommercialLine_TE } from '@products/commercial-line-te.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { Id } from '@shared/value-objects'
import {
  CommercialLine_TE as PrismaCommercialLine_TE,
  Prisma
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

export type CommercialLine_TEFilter = {
  name?: string
  systemState?: SystemState
}

export abstract class CommercialLine_TE_Repository {
  abstract findById(
    id: string,
    ctx: RequestContext
  ): Promise<CommercialLine_TE | null>
  abstract findAll(
    filter: CommercialLine_TEFilter,
    ctx: RequestContext
  ): Promise<CommercialLine_TE[]>
  abstract save(
    line: CommercialLine_TE,
    ctx: RequestContext
  ): Promise<CommercialLine_TE>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaCommercialLine_TE_Repository implements CommercialLine_TE_Repository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<CommercialLine_TE | null> {
    const where: Prisma.CommercialLine_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const prismaLine = await this.prisma.commercialLine_TE.findUnique({ where })
    if (!prismaLine) return null
    if (
      prismaLine &&
      effectiveTenantId &&
      prismaLine.systemState === SystemState.DELETED
    ) {
      return null
    }
    return PrismaCommercialLine_TEMapper.toDomain(prismaLine)
  }

  async findAll(
    filter: CommercialLine_TEFilter,
    ctx: RequestContext
  ): Promise<CommercialLine_TE[]> {
    const where: Prisma.CommercialLine_TEWhereInput = {
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
    const prismaLines = await this.prisma.commercialLine_TE.findMany({
      where,
      orderBy: { name: 'asc' }
    })
    return prismaLines.map((line) =>
      PrismaCommercialLine_TEMapper.toDomain(line)
    )
  }

  async save(
    line: CommercialLine_TE,
    ctx: RequestContext
  ): Promise<CommercialLine_TE> {
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId && line.tenantId !== effectiveTenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    const id = line.id.value
    const prismaLine = PrismaCommercialLine_TEMapper.toPersistence(line)
    await this.prisma.commercialLine_TE.upsert({
      where: { id },
      update: prismaLine,
      create: prismaLine
    })
    return line
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.CommercialLine_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    await this.prisma.commercialLine_TE.update({
      where,
      data: { systemState: SystemState.DELETED, updatedAt: new Date() }
    })
  }
}

class PrismaCommercialLine_TEMapper {
  static toDomain(prismaLine: PrismaCommercialLine_TE): CommercialLine_TE {
    const systemState =
      SystemState[prismaLine.systemState as keyof typeof SystemState]
    if (!systemState) {
      throw new Error(`Invalid systemState value: ${prismaLine.systemState}`)
    }
    return CommercialLine_TE.rehydrate({
      id: Id.from(prismaLine.id),
      createdAt: prismaLine.createdAt,
      updatedAt: prismaLine.updatedAt,
      systemState,
      tenantId: prismaLine.tenantId,
      name: prismaLine.name,
      description: prismaLine.description
    })
  }

  static toPersistence(
    line: CommercialLine_TE
  ): Prisma.CommercialLine_TEUncheckedCreateInput {
    return {
      id: line.id.value,
      createdAt: line.createdAt,
      updatedAt: line.updatedAt,
      systemState: line.systemState,
      tenantId: line.tenantId,
      name: line.name,
      description: line.description
    }
  }
}
