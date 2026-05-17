import { Injectable } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { Identity } from '@identities/identity.entity'
import { Identity as PrismaIdentity, Prisma } from '@prisma/client'
import { Id } from '@shared/value-objects'
import { SystemState } from '@shared/enums'
import { AuthProviderType } from '@authentication/authentication.types'

export abstract class IdentityRepository {
  abstract findById(id: string): Promise<Identity | null>
  abstract findAll(filter?: IdentityFilter): Promise<Identity[]>
  abstract save(identity: Identity): Promise<Identity>
  abstract delete(id: string): Promise<void>
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

  async findById(id: string): Promise<Identity | null> {
    const prismaIdentity = await this.prisma.identity.findUnique({
      where: { id }
    })
    if (!prismaIdentity) return null
    return IdentityMapper.toDomain(prismaIdentity)
  }

  async findAll(filter?: IdentityFilter): Promise<Identity[]> {
    const where: Prisma.IdentityWhereInput = {}

    if (filter?.userId) {
      where.userId = filter.userId
    }
    if (filter?.authProviderType) {
      where.authProviderType = filter.authProviderType
    }
    if (filter?.identifier) {
      where.identifier = { contains: filter.identifier, mode: 'insensitive' }
    }
    if (filter?.systemState) {
      where.systemState = filter.systemState
    }

    const prismaIdentities = await this.prisma.identity.findMany({ where })
    return prismaIdentities.map((prismaIdentity) =>
      IdentityMapper.toDomain(prismaIdentity)
    )
  }

  async save(identity: Identity): Promise<Identity> {
    const prismaIdentity = IdentityMapper.toPersistence(identity)
    await this.prisma.identity.upsert({
      where: { id: prismaIdentity.id },
      update: prismaIdentity,
      create: prismaIdentity
    })
    return identity
  }

  async delete(id: string): Promise<void> {
    await this.prisma.identity.delete({ where: { id } })
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
