import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { TenantMembership } from '@tenant-memberships/tenant-membership.entity'
import { Id } from '@shared/value-objects'
import { SystemState } from '@shared/behaviours/lockable'
import { TenantRole } from '@users/user.types'
import {
  TenantMembership as PrismaTenantMembership,
  TenantRole as PrismaTenantRole,
  Prisma
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

export type TenantMembershipFilter = {
  userId?: string
  tenantId?: string
  isOwner?: boolean
  roles?: TenantRole[]
}

export abstract class TenantMembershipRepository {
  abstract findById(
    id: string,
    ctx: RequestContext
  ): Promise<TenantMembership | null>
  abstract findByUserId(
    userId: string,
    ctx: RequestContext
  ): Promise<TenantMembership[]>
  abstract findAll(
    filter: TenantMembershipFilter,
    ctx: RequestContext
  ): Promise<TenantMembership[]>
  abstract save(
    membership: TenantMembership,
    ctx: RequestContext
  ): Promise<TenantMembership>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaTenantMembershipRepository implements TenantMembershipRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<TenantMembership | null> {
    const where: Prisma.TenantMembershipWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const membership = await this.prisma.tenantMembership.findUnique({
      where
    })
    if (!membership) return null
    return PrismaTenantMembershipMapper.toDomain(membership)
  }

  async findByUserId(
    userId: string,
    ctx: RequestContext
  ): Promise<TenantMembership[]> {
    const where: Prisma.TenantMembershipWhereInput = { userId }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const memberships = await this.prisma.tenantMembership.findMany({
      where
    })
    return memberships.map((m) => PrismaTenantMembershipMapper.toDomain(m))
  }

  async findAll(
    filter: TenantMembershipFilter,
    ctx: RequestContext
  ): Promise<TenantMembership[]> {
    const where: Prisma.TenantMembershipWhereInput = {}

    if (filter.userId) where.userId = filter.userId
    if (filter.tenantId) where.tenantId = filter.tenantId
    if (filter.isOwner !== undefined) where.isOwner = filter.isOwner
    if (filter.roles && filter.roles.length > 0) {
      const role = filter.roles[0]
      if (role) where.roles = { has: role as PrismaTenantRole }
    }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }

    const memberships = await this.prisma.tenantMembership.findMany({ where })
    return memberships.map((m) => PrismaTenantMembershipMapper.toDomain(m))
  }

  async save(
    membership: TenantMembership,
    ctx: RequestContext
  ): Promise<TenantMembership> {
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId && membership.tenantId !== effectiveTenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    const prismaData = PrismaTenantMembershipMapper.toPersistence(membership)

    await this.prisma.tenantMembership.upsert({
      where: { id: membership.id.value },
      update: prismaData,
      create: prismaData
    })

    return membership
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.TenantMembershipWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    await this.prisma.tenantMembership.delete({ where })
  }
}

class PrismaTenantMembershipMapper {
  static toDomain(m: PrismaTenantMembership): TenantMembership {
    return TenantMembership.rehydrate({
      id: Id.from(m.id),
      userId: m.userId,
      tenantId: m.tenantId,
      isOwner: m.isOwner,
      roles: m.roles as TenantRole[],
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      systemState: SystemState[m.systemState as keyof typeof SystemState]
    })
  }

  static toPersistence(membership: TenantMembership): PrismaTenantMembership {
    return {
      id: membership.id.value,
      userId: membership.userId,
      tenantId: membership.tenantId,
      isOwner: membership.isOwner,
      roles: membership.roles as PrismaTenantRole[],
      systemState: membership.systemState,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt
    }
  }
}
