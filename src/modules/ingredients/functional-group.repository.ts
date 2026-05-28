import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { FunctionalGroup } from '@ingredients/functional-group.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { Id } from '@shared/value-objects'
import { FunctionalGroup as PrismaFunctionalGroup, Prisma } from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'

export type FunctionalGroupFilter = {
  name?: string
  code?: string
  isActive?: boolean
  systemState?: SystemState
}

export abstract class FunctionalGroupRepository {
  abstract findById(id: string, ctx: RequestContext): Promise<FunctionalGroup | null>
  abstract findAll(filter: FunctionalGroupFilter, ctx: RequestContext): Promise<FunctionalGroup[]>
  abstract save(group: FunctionalGroup, ctx: RequestContext): Promise<FunctionalGroup>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaFunctionalGroupRepository implements FunctionalGroupRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, ctx: RequestContext): Promise<FunctionalGroup | null> {
    const where: Prisma.FunctionalGroupWhereUniqueInput = { id }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    const prismaGroup = await this.prisma.functionalGroup.findUnique({ where })
    if (!prismaGroup) return null
    if (prismaGroup && ctx.scope === UserScope.TENANT && prismaGroup.systemState === SystemState.HIDDEN) {
      return null
    }
    return PrismaFunctionalGroupMapper.toDomain(prismaGroup)
  }

  async findAll(filter: FunctionalGroupFilter, ctx: RequestContext): Promise<FunctionalGroup[]> {
    const where: Prisma.FunctionalGroupWhereInput = {
      ...(filter.name && { name: { contains: filter.name, mode: 'insensitive' } }),
      ...(filter.code && { code: { contains: filter.code, mode: 'insensitive' } }),
      ...(filter.isActive !== undefined && { isActive: filter.isActive }),
      ...(filter.systemState && { systemState: filter.systemState })
    }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    if (ctx.scope === UserScope.TENANT) {
      where.systemState = { not: SystemState.HIDDEN }
    }
    const prismaGroups = await this.prisma.functionalGroup.findMany({
      where,
      orderBy: { sortOrder: 'asc' }
    })
    return prismaGroups.map((group) => PrismaFunctionalGroupMapper.toDomain(group))
  }

  async save(group: FunctionalGroup, ctx: RequestContext): Promise<FunctionalGroup> {
    if (ctx.scope === UserScope.TENANT && group.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    const id = group.id.value
    const prismaGroup = PrismaFunctionalGroupMapper.toPersistence(group)
    await this.prisma.functionalGroup.upsert({
      where: { id },
      update: prismaGroup,
      create: prismaGroup
    })
    return group
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.FunctionalGroupWhereUniqueInput = { id }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    await this.prisma.functionalGroup.update({
      where,
      data: { systemState: SystemState.HIDDEN, updatedAt: new Date() }
    })
  }
}

class PrismaFunctionalGroupMapper {
  static toDomain(prismaGroup: PrismaFunctionalGroup): FunctionalGroup {
    const systemState = SystemState[prismaGroup.systemState as keyof typeof SystemState]
    if (!systemState) {
      throw new Error(`Invalid systemState value: ${prismaGroup.systemState}`)
    }
    return FunctionalGroup.rehydrate({
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

  static toPersistence(group: FunctionalGroup): Prisma.FunctionalGroupUncheckedCreateInput {
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
