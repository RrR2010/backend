import { PrismaService } from '@shared/prisma/prisma.service'
import { Session } from '@authentication/session.entity'
import { Prisma, Session as PrismaSession } from '@prisma/client'
import { Id } from '@shared/value-objects'
import { Injectable } from '@nestjs/common'

export abstract class SessionRepository {
  abstract findById(id: string): Promise<Session | null>
  abstract findAll(filter?: SessionFilter): Promise<Session[]>
  abstract save(session: Session): Promise<Session>
  abstract delete(id: string): Promise<void>
}

export type SessionFilter = {
  id?: string
  userId?: string
  tenantId?: string
  refreshTokenHash?: string
  deviceInfo?: string
  ipAddress?: string
  expiresAt?: Date
  revokedAt?: Date
}

@Injectable()
export class PrismaSessionRepository implements SessionRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async findById(id: string): Promise<Session | null> {
    const session = await this.prismaService.session.findUnique({
      where: { id }
    })
    if (!session) return null
    return PrismaSessionMapper.toDomain(session)
  }
  async findAll(filter?: SessionFilter): Promise<Session[]> {
    const where: Prisma.SessionWhereInput = {}
    if (filter?.id) where.id = filter.id
    if (filter?.userId) where.userId = filter.userId
    if (filter?.tenantId) where.tenantId = filter.tenantId
    if (filter?.refreshTokenHash)
      where.refreshTokenHash = filter.refreshTokenHash
    if (filter?.deviceInfo) where.deviceInfo = filter.deviceInfo
    if (filter?.ipAddress) where.ipAddress = filter.ipAddress
    if (filter?.expiresAt) where.expiresAt = filter.expiresAt
    if (filter?.revokedAt) where.revokedAt = filter.revokedAt

    const prismaSessions = await this.prismaService.session.findMany({ where })
    const sessions = prismaSessions.map((prismaSession) =>
      PrismaSessionMapper.toDomain(prismaSession)
    )
    return sessions
  }
  async save(session: Session): Promise<Session> {
    const prismaSession = PrismaSessionMapper.toPersistence(session)
    await this.prismaService.session.upsert({
      where: { id: session.id.value },
      update: prismaSession,
      create: prismaSession
    })
    return session
  }
  async delete(id: string): Promise<void> {
    await this.prismaService.session.delete({ where: { id } })
  }
}

class PrismaSessionMapper {
  static toDomain(prismaSession: PrismaSession): Session {
    return Session.rehydrate({
      id: Id.from(prismaSession.id),
      createdAt: prismaSession.createdAt,
      updatedAt: prismaSession.updatedAt,
      userId: prismaSession.userId,
      tenantId: prismaSession.tenantId,
      refreshTokenHash: prismaSession.refreshTokenHash,
      deviceInfo: prismaSession.deviceInfo,
      ipAddress: prismaSession.ipAddress,
      expiresAt: prismaSession.expiresAt,
      revokedAt: prismaSession.revokedAt
    })
  }

  static toPersistence(session: Session): PrismaSession {
    return {
      id: session.id.value,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      userId: session.userId,
      tenantId: session.tenantId,
      refreshTokenHash: session.refreshTokenHash,
      deviceInfo: session.deviceInfo ?? null,
      ipAddress: session.ipAddress ?? null,
      expiresAt: session.expiresAt,
      revokedAt: session.revokedAt
    }
  }
}
