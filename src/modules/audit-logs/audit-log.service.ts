import { Injectable } from '@nestjs/common'
import { AuditLogRepository, AuditLogFilter } from '@audit-logs/audit-log.repository'
import { AuditLog, CreateAuditLogProps } from '@audit-logs/audit-log.entity'
import { AuditLogNotFoundError } from '@audit-logs/audit-log.errors'
import { RequestContext } from '@authorization/authorization.types'

@Injectable()
export class AuditLogService {
  constructor(private readonly repository: AuditLogRepository) {}

  async create(props: CreateAuditLogProps, context: RequestContext): Promise<AuditLog> {
    const auditLog = AuditLog.create(props)
    return this.repository.save(auditLog)
  }

  async findAll(filter?: AuditLogFilter, context?: RequestContext): Promise<AuditLog[]> {
    return this.repository.findAll(filter)
  }

  async findById(id: string, context: RequestContext): Promise<AuditLog> {
    const auditLog = await this.repository.findById(id)
    if (!auditLog) {
      throw new AuditLogNotFoundError(id)
    }
    return auditLog
  }

  async save(auditLog: AuditLog, context: RequestContext): Promise<AuditLog> {
    return this.repository.save(auditLog)
  }
}