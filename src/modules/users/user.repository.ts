import { PrismaService } from '@shared/prisma/prisma.service'
import { User } from '@users/user.entity'
import { UserScope } from '@users/user.types'
import { User as PrismaUser, Prisma } from '@prisma/client'
import { SystemState } from '@shared/behaviours/lockable'
import { ForbiddenException, Injectable } from '@nestjs/common'
import { Id } from '@shared/value-objects'
import { RequestContext } from '@authorization/authorization.types'

export abstract class UserRepository {
  abstract findById(id: string, ctx: RequestContext): Promise<User | null>
  abstract findAll(filter: UserFilter, ctx: RequestContext): Promise<User[]>
  abstract save(user: User, ctx: RequestContext): Promise<User>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

export type UserFilter = {
  scope?: UserScope
  systemState?: SystemState
}

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<User | null> {
    const where: Prisma.UserWhereUniqueInput = { id }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantMemberships = { some: { tenantId: ctx.tenantId } }
    }
    const prismaUser = await this.prismaService.user.findUnique({
      where
    })
    if (!prismaUser) return null
    const user = PrismaUserMapper.toDomain(prismaUser)
    return user
  }

  async findAll(
    filter: UserFilter,
    ctx: RequestContext
  ): Promise<User[]> {
    const where: Prisma.UserWhereInput = {}

    if (filter.scope) {
      where.scope = filter.scope
    }
    if (filter.systemState) {
      where.systemState = filter.systemState
    }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantMemberships = { some: { tenantId: ctx.tenantId } }
    }

    const prismaUsers = await this.prismaService.user.findMany({ where })
    const users = prismaUsers.map((prismaUser) =>
      PrismaUserMapper.toDomain(prismaUser)
    )
    return users
  }

  async save(user: User, ctx: RequestContext): Promise<User> {
    if (ctx.scope === UserScope.TENANT) {
      const membership = await this.prismaService.tenantMembership.findFirst({
        where: { userId: user.id.value, tenantId: ctx.tenantId }
      })
      if (!membership) {
        throw new ForbiddenException('Cannot modify user outside your tenant')
      }
    }
    const prismaUser = PrismaUserMapper.toPersistence(user)
    await this.prismaService.user.upsert({
      where: { id: prismaUser.id },
      update: prismaUser,
      create: prismaUser
    })
    return user
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.UserWhereUniqueInput = { id }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantMemberships = { some: { tenantId: ctx.tenantId } }
    }
    await this.prismaService.user.delete({ where })
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
