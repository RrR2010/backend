import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { AuditLog } from '@audit-logs/audit-log.entity'
import { AuditLog as PrismaAuditLog, Prisma } from '@prisma/client'
import { Id } from '@shared/value-objects'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'

export abstract class AuditLogRepository {
  abstract findById(id: string, ctx: RequestContext): Promise<AuditLog | null>
  abstract save(auditLog: AuditLog, ctx: RequestContext): Promise<AuditLog>
  abstract findAll(
    filter: AuditLogFilter,
    ctx: RequestContext
  ): Promise<AuditLog[]>
}

export type AuditLogFilter = {
  userId?: string
  tenantId?: string
  entityName?: string
  entityId?: string
  action?: string
  createdAfter?: Date
  createdBefore?: Date
}

@Injectable()
export class PrismaAuditLogRepository implements AuditLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, ctx: RequestContext): Promise<AuditLog | null> {
    const where: Prisma.AuditLogWhereUniqueInput = { id }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    const prismaAuditLog = await this.prisma.auditLog.findUnique({
      where
    })
    if (!prismaAuditLog) return null
    return AuditLogMapper.toDomain(prismaAuditLog)
  }

  async save(auditLog: AuditLog, ctx: RequestContext): Promise<AuditLog> {
    if (ctx.scope === UserScope.TENANT && auditLog.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    const prismaAuditLog = AuditLogMapper.toPersistence(auditLog)
    await this.prisma.auditLog.upsert({
      where: { id: auditLog.id.value },
      update: prismaAuditLog,
      create: prismaAuditLog
    })
    return auditLog
  }

  async findAll(
    filter: AuditLogFilter,
    ctx: RequestContext
  ): Promise<AuditLog[]> {
    const where: Prisma.AuditLogWhereInput = {}

    if (filter.userId) {
      where.userId = filter.userId
    }
    if (filter.tenantId) {
      where.tenantId = filter.tenantId
    }
    if (filter.entityName) {
      where.entityName = filter.entityName
    }
    if (filter.entityId) {
      where.entityId = filter.entityId
    }
    if (filter.action) {
      where.action = filter.action
    }
    if (filter.createdAfter || filter.createdBefore) {
      where.createdAt = {}
      if (filter.createdAfter) {
        where.createdAt.gte = filter.createdAfter
      }
      if (filter.createdBefore) {
        where.createdAt.lte = filter.createdBefore
      }
    }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }

    const prismaAuditLogs = await this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })
    return prismaAuditLogs.map((prismaAuditLog) =>
      AuditLogMapper.toDomain(prismaAuditLog)
    )
  }
}

class AuditLogMapper {
  static toDomain(prismaAuditLog: PrismaAuditLog): AuditLog {
    return AuditLog.rehydrate({
      id: Id.from(prismaAuditLog.id),
      createdAt: prismaAuditLog.createdAt,
      updatedAt: prismaAuditLog.updatedAt,
      userId: prismaAuditLog.userId,
      tenantId: prismaAuditLog.tenantId,
      entityName: prismaAuditLog.entityName,
      entityId: prismaAuditLog.entityId,
      ipAddress: prismaAuditLog.ipAddress,
      userAgent: prismaAuditLog.userAgent,
      action: prismaAuditLog.action,
      before: prismaAuditLog.before as Record<string, unknown> | null,
      after: prismaAuditLog.after as Record<string, unknown> | null,
      description: prismaAuditLog.description
    })
  }

  static toPersistence(
    auditLog: AuditLog
  ): Prisma.AuditLogUncheckedCreateInput {
    const userId = auditLog.userId === 'system' ? null : auditLog.userId
    return {
      id: auditLog.id.value,
      createdAt: auditLog.createdAt,
      updatedAt: auditLog.updatedAt,
      userId,
      tenantId: auditLog.tenantId,
      entityName: auditLog.entityName,
      entityId: auditLog.entityId,
      ipAddress: auditLog.ipAddress,
      userAgent: auditLog.userAgent,
      action: auditLog.action,
      description: auditLog.description,
      before:
        auditLog.before === null
          ? Prisma.JsonNull
          : (auditLog.before as Prisma.InputJsonValue),
      after:
        auditLog.after === null
          ? Prisma.JsonNull
          : (auditLog.after as Prisma.InputJsonValue)
    }
  }
}
