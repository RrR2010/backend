import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { PlatformMembership } from '@platform-memberships/platform-membership.entity'
import { Id } from '@shared/value-objects'
import { SystemState } from '@shared/behaviours/lockable'
import { PlatformRole, UserScope } from '@users/user.types'
import {
  PlatformMembership as PrismaPlatformMembership,
  PlatformRole as PrismaPlatformRole,
  Prisma
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'

// EXCEÇÃO: Repositório de platform-membership não tem tenantId — filtra por userId.
// Impersonação não se aplica porque a membership é sempre do usuário logado,
// independente do tenant impersonado.

export type PlatformMembershipFilter = {
  userId?: string
  roles?: PlatformRole[]
}

export abstract class PlatformMembershipRepository {
  abstract findById(
    id: string,
    ctx: RequestContext
  ): Promise<PlatformMembership | null>
  abstract findAll(
    filter: PlatformMembershipFilter,
    ctx: RequestContext
  ): Promise<PlatformMembership[]>
  abstract save(
    membership: PlatformMembership,
    ctx: RequestContext
  ): Promise<PlatformMembership>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaPlatformMembershipRepository implements PlatformMembershipRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<PlatformMembership | null> {
    const where: Prisma.PlatformMembershipWhereUniqueInput = { id }
    if (ctx.scope === UserScope.TENANT) {
      where.userId = ctx.userId
    }
    const pm = await this.prisma.platformMembership.findUnique({ where })
    if (!pm) return null
    return PrismaPlatformMembershipMapper.toDomain(pm)
  }

  async findAll(
    filter: PlatformMembershipFilter,
    ctx: RequestContext
  ): Promise<PlatformMembership[]> {
    const where: Prisma.PlatformMembershipWhereInput = {}

    if (filter.userId) {
      where.userId = filter.userId
    }
    if (filter.roles && filter.roles.length > 0) {
      where.roles = { hasSome: filter.roles as PrismaPlatformRole[] }
    }
    if (ctx.scope === UserScope.TENANT) {
      where.userId = ctx.userId
    }

    const prismaMemberships = await this.prisma.platformMembership.findMany({
      where
    })
    return prismaMemberships.map((pm) =>
      PrismaPlatformMembershipMapper.toDomain(pm)
    )
  }

  async save(
    membership: PlatformMembership,
    ctx: RequestContext
  ): Promise<PlatformMembership> {
    if (ctx.scope === UserScope.TENANT && membership.userId !== ctx.userId) {
      throw new ForbiddenException(
        'Cannot modify platform membership outside your own account'
      )
    }
    const data = PrismaPlatformMembershipMapper.toPersistence(membership)
    await this.prisma.platformMembership.upsert({
      where: { id: membership.id.value },
      update: data,
      create: data
    })
    return membership
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.PlatformMembershipWhereUniqueInput = { id }
    if (ctx.scope === UserScope.TENANT) {
      where.userId = ctx.userId
    }
    await this.prisma.platformMembership.delete({ where })
  }
}

class PrismaPlatformMembershipMapper {
  static toDomain(
    prismaMembership: PrismaPlatformMembership
  ): PlatformMembership {
    return PlatformMembership.rehydrate({
      id: Id.from(prismaMembership.id),
      createdAt: prismaMembership.createdAt,
      updatedAt: prismaMembership.updatedAt,
      systemState:
        SystemState[prismaMembership.systemState as keyof typeof SystemState],
      userId: prismaMembership.userId,
      roles: prismaMembership.roles as PlatformRole[]
    })
  }

  static toPersistence(
    membership: PlatformMembership
  ): PrismaPlatformMembership {
    return {
      id: membership.id.value,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
      systemState: membership.systemState,
      userId: membership.userId,
      roles: membership.roles as PrismaPlatformRole[]
    }
  }
}
