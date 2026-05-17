import { Injectable } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { PlatformMembership } from '@platform-memberships/platform-membership.entity'
import { Id } from '@shared/value-objects'
import { SystemState } from '@shared/enums'
import { PlatformRole } from '@users/user.types'
import { PlatformMembership as PrismaPlatformMembership, PlatformRole as PrismaPlatformRole, Prisma } from '@prisma/client'

export type PlatformMembershipFilter = {
  userId?: string
  roles?: PlatformRole[]
}

export abstract class PlatformMembershipRepository {
  abstract findById(id: string): Promise<PlatformMembership | null>
  abstract findAll(filter?: PlatformMembershipFilter): Promise<PlatformMembership[]>
  abstract save(membership: PlatformMembership): Promise<PlatformMembership>
  abstract delete(id: string): Promise<void>
}

@Injectable()
export class PrismaPlatformMembershipRepository
  implements PlatformMembershipRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<PlatformMembership | null> {
    const pm = await this.prisma.platformMembership.findUnique({
      where: { id }
    })
    if (!pm) return null
    return PrismaPlatformMembershipMapper.toDomain(pm)
  }

  async findAll(filter?: PlatformMembershipFilter): Promise<PlatformMembership[]> {
    const where: Prisma.PlatformMembershipWhereInput = {}

    if (filter?.userId) {
      where.userId = filter.userId
    }
    if (filter?.roles && filter.roles.length > 0) {
      where.roles = { hasSome: filter.roles as PrismaPlatformRole[] }
    }

    const prismaMemberships = await this.prisma.platformMembership.findMany({ where })
    return prismaMemberships.map((pm) =>
      PrismaPlatformMembershipMapper.toDomain(pm)
    )
  }

  async save(membership: PlatformMembership): Promise<PlatformMembership> {
    const data = PrismaPlatformMembershipMapper.toPersistence(membership)
    await this.prisma.platformMembership.upsert({
      where: { id: membership.id.value },
      update: data,
      create: data
    })
    return membership
  }

  async delete(id: string): Promise<void> {
    await this.prisma.platformMembership.delete({ where: { id } })
  }
}

class PrismaPlatformMembershipMapper {
  static toDomain(prismaMembership: PrismaPlatformMembership): PlatformMembership {
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

  static toPersistence(membership: PlatformMembership): PrismaPlatformMembership {
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
