import { PrismaService } from '@shared/prisma/prisma.service'
import { User } from '@users/user.entity'
import { UserScope } from '@users/user.types'
import { User as PrismaUser, Prisma } from '@prisma/client'
import { SystemState } from '@shared/enums'
import { Injectable } from '@nestjs/common'
import { Id } from '@shared/value-objects'

export abstract class UserRepository {
  abstract findById(id: string): Promise<User | null>
  abstract findAll(filter?: UserFilter): Promise<User[]>
  abstract save(user: User): Promise<User>
  abstract delete(id: string): Promise<void>
}

export type UserFilter = {
  scope?: UserScope
  systemState?: SystemState
}

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const prismaUser = await this.prismaService.user.findUnique({
      where: { id }
    })
    if (!prismaUser) return null
    const user = PrismaUserMapper.toDomain(prismaUser)
    return user
  }

  async findAll(filter?: UserFilter): Promise<User[]> {
    const where: Prisma.UserWhereInput = {}

    if (filter?.scope) {
      where.scope = filter.scope
    }
    if (filter?.systemState) {
      where.systemState = filter.systemState
    }

    const prismaUsers = await this.prismaService.user.findMany({ where })
    const users = prismaUsers.map((prismaUser) =>
      PrismaUserMapper.toDomain(prismaUser)
    )
    return users
  }

  async save(user: User): Promise<User> {
    const prismaUser = PrismaUserMapper.toPersistence(user)
    await this.prismaService.user.upsert({
      where: { id: prismaUser.id },
      update: prismaUser,
      create: prismaUser
    })
    return user
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.user.delete({ where: { id } })
  }
}

class PrismaUserMapper {
  static toDomain(prismaUser: PrismaUser): User {
    return User.rehydrate({
      id: Id.from(prismaUser.id),
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
      systemState:
        SystemState[prismaUser.systemState as keyof typeof SystemState],
      scope: prismaUser.scope as UserScope
    })
  }

  static toPersistence(user: User): PrismaUser {
    return {
      id: user.id.value,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      systemState: user.systemState,
      scope: user.scope
    }
  }
}
