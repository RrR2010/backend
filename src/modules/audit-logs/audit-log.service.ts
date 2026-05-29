import { Injectable } from '@nestjs/common'
import {
  AuditLogRepository,
  AuditLogFilter
} from '@audit-logs/audit-log.repository'
import { AuditLog, CreateAuditLogProps } from '@audit-logs/audit-log.entity'
import { AuditLogNotFoundError } from '@audit-logs/audit-log.errors'
import { RequestContext } from '@authorization/authorization.types'

@Injectable()
export class AuditLogService {
  constructor(private readonly repository: AuditLogRepository) {}

  async create(
    props: CreateAuditLogProps,
    ctx: RequestContext
  ): Promise<AuditLog> {
    const auditLog = AuditLog.create(props)
    return this.repository.save(auditLog, ctx)
  }

  async findAll(
    filter: AuditLogFilter,
    ctx: RequestContext
  ): Promise<AuditLog[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(id: string, ctx: RequestContext): Promise<AuditLog> {
    const auditLog = await this.repository.findById(id, ctx)
    if (!auditLog) {
      throw new AuditLogNotFoundError(id)
    }
    return auditLog
  }

  async save(auditLog: AuditLog, ctx: RequestContext): Promise<AuditLog> {
    return this.repository.save(auditLog, ctx)
  }
}
