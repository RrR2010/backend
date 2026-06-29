import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { FunctionalGroup_TE } from '@ingredients/functional-group.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { Id } from '@shared/value-objects'
import {
  FunctionalGroup_TE as PrismaFunctionalGroup_TE,
  Prisma
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

export type FunctionalGroupFilter = {
  name?: string
  code?: string
  isActive?: boolean
  systemState?: SystemState
  skip?: number
  take?: number
}

export abstract class FunctionalGroupRepository {
  abstract findById(
    id: string,
    ctx: RequestContext
  ): Promise<FunctionalGroup_TE | null>
  abstract findAll(
    filter: FunctionalGroupFilter,
    ctx: RequestContext
  ): Promise<FunctionalGroup_TE[]>
  abstract save(
    group: FunctionalGroup_TE,
    ctx: RequestContext
  ): Promise<FunctionalGroup_TE>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaFunctionalGroup_TERepository implements FunctionalGroupRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<FunctionalGroup_TE | null> {
    const where: Prisma.FunctionalGroup_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const prismaGroup = await this.prisma.functionalGroup_TE.findUnique({ where })
    if (!prismaGroup) return null
    if (
      prismaGroup &&
      effectiveTenantId &&
      prismaGroup.systemState === SystemState.DELETED
    ) {
      return null
    }
    return PrismaFunctionalGroup_TEMapper.toDomain(prismaGroup)
  }

  async findAll(
    filter: FunctionalGroupFilter,
    ctx: RequestContext
  ): Promise<FunctionalGroup_TE[]> {
    const where: Prisma.FunctionalGroup_TEWhereInput = {
      ...(filter.name && {
        name: { contains: filter.name, mode: 'insensitive' }
      }),
      ...(filter.code && {
        code: { contains: filter.code, mode: 'insensitive' }
      }),
      ...(filter.isActive !== undefined && { isActive: filter.isActive }),
      ...(filter.systemState && { systemState: filter.systemState })
    }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    if (effectiveTenantId) {
      where.systemState = { not: SystemState.DELETED }
    }
    const prismaGroups = await this.prisma.functionalGroup_TE.findMany({
      where,
      skip: filter.skip ?? 0,
      take: filter.take ?? 50,
      orderBy: { sortOrder: 'asc' }
    })
    return prismaGroups.map((group) =>
      PrismaFunctionalGroup_TEMapper.toDomain(group)
    )
  }

  async save(
    group: FunctionalGroup_TE,
    ctx: RequestContext
  ): Promise<FunctionalGroup_TE> {
    if (ctx.scope === UserScope.TENANT && group.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    const id = group.id.value
    const prismaGroup = PrismaFunctionalGroup_TEMapper.toPersistence(group)
    await this.prisma.functionalGroup_TE.upsert({
      where: { id },
      update: prismaGroup,
      create: prismaGroup
    })
    return group
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.FunctionalGroup_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    await this.prisma.functionalGroup_TE.update({
      where,
      data: { systemState: SystemState.DELETED, updatedAt: new Date() }
    })
  }
}

class PrismaFunctionalGroup_TEMapper {
  static toDomain(prismaGroup: PrismaFunctionalGroup_TE): FunctionalGroup_TE {
    const systemState =
      SystemState[prismaGroup.systemState as keyof typeof SystemState]
    if (!systemState) {
      throw new Error(`Invalid systemState value: ${prismaGroup.systemState}`)
    }
    return FunctionalGroup_TE.rehydrate({
      id: Id.from(prismaGroup.id),
      createdAt: prismaGroup.createdAt,
      updatedAt: prismaGroup.updatedAt,
      systemState,
      tenantId: prismaGroup.tenantId,
      name: prismaGroup.name,
      code: prismaGroup.code,
      sortOrder: prismaGroup.sortOrder,
      isActive: prismaGroup.isActive
    })
  }

  static toPersistence(
    group: FunctionalGroup_TE
  ): Prisma.FunctionalGroup_TEUncheckedCreateInput {
    return {
      id: group.id.value,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      systemState: group.systemState,
      tenantId: group.tenantId,
      name: group.name,
      code: group.code,
      sortOrder: group.sortOrder,
      isActive: group.isActive
    }
  }
}
