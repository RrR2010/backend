import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { Identity } from '@identities/identity.entity'
import { Identity as PrismaIdentity, Prisma } from '@prisma/client'
import { Id } from '@shared/value-objects'
import { SystemState } from '@shared/enums'
import { AuthProviderType } from '@authentication/authentication.types'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'

export abstract class IdentityRepository {
  abstract findById(id: string, ctx: RequestContext): Promise<Identity | null>
  abstract findAll(
    filter: IdentityFilter,
    ctx: RequestContext
  ): Promise<Identity[]>
  abstract save(identity: Identity, ctx: RequestContext): Promise<Identity>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

export type IdentityFilter = {
  userId?: string
  authProviderType?: AuthProviderType
  identifier?: string
  systemState?: SystemState
}

@Injectable()
export class PrismaIdentityRepository implements IdentityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, ctx: RequestContext): Promise<Identity | null> {
    const where: Prisma.IdentityWhereInput = { id }
    if (ctx.scope === UserScope.TENANT) {
      where.user = {
        tenantMemberships: {
          some: {
            tenantId: ctx.tenantId
          }
        }
      }
    }
    const prismaIdentity = await this.prisma.identity.findFirst({ where })
    if (!prismaIdentity) return null
    return IdentityMapper.toDomain(prismaIdentity)
  }

  async findAll(
    filter: IdentityFilter,
    ctx: RequestContext
  ): Promise<Identity[]> {
    const where: Prisma.IdentityWhereInput = {}

    if (filter.userId) {
      where.userId = filter.userId
    }
    if (filter.authProviderType) {
      where.authProviderType = filter.authProviderType
    }
    if (filter.identifier) {
      where.identifier = { contains: filter.identifier, mode: 'insensitive' }
    }
    if (filter.systemState) {
      where.systemState = filter.systemState
    }

    if (ctx.scope === UserScope.TENANT) {
      where.user = {
        tenantMemberships: {
          some: {
            tenantId: ctx.tenantId
          }
        }
      }
    }

    const prismaIdentities = await this.prisma.identity.findMany({ where })
    return prismaIdentities.map((prismaIdentity) =>
      IdentityMapper.toDomain(prismaIdentity)
    )
  }

  async save(identity: Identity, ctx: RequestContext): Promise<Identity> {
    if (ctx.scope === UserScope.TENANT) {
      const user = await this.prisma.user.findFirst({
        where: {
          id: identity.userId,
          tenantMemberships: {
            some: {
              tenantId: ctx.tenantId
            }
          }
        }
      })
      if (!user) {
        throw new ForbiddenException(
          'Cannot modify resource outside your tenant'
        )
      }
    }
    const prismaIdentity = IdentityMapper.toPersistence(identity)
    await this.prisma.identity.upsert({
      where: { id: prismaIdentity.id },
      update: prismaIdentity,
      create: prismaIdentity
    })
    return identity
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.IdentityWhereInput = { id }
    if (ctx.scope === UserScope.TENANT) {
      where.user = {
        tenantMemberships: {
          some: {
            tenantId: ctx.tenantId
          }
        }
      }
    }
    await this.prisma.identity.deleteMany({ where })
  }
}

class IdentityMapper {
  static toDomain(prismaIdentity: PrismaIdentity): Identity {
    return Identity.rehydrate({
      id: Id.from(prismaIdentity.id),
      createdAt: prismaIdentity.createdAt,
      updatedAt: prismaIdentity.updatedAt,
      systemState:
        SystemState[prismaIdentity.systemState as keyof typeof SystemState],
      userId: prismaIdentity.userId,
      authProviderType: prismaIdentity.authProviderType as AuthProviderType,
      identifier: prismaIdentity.identifier,
      secretHash: prismaIdentity.secretHash
    })
  }

  static toPersistence(identity: Identity): PrismaIdentity {
    return {
      id: identity.id.value,
      createdAt: identity.createdAt,
      updatedAt: identity.updatedAt,
      systemState: identity.systemState,
      userId: identity.userId,
      authProviderType: identity.authProviderType,
      identifier: identity.identifier,
      secretHash: identity.secretHash
    }
  }
}
