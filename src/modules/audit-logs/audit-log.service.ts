import { Injectable } from '@nestjs/common'
import {
  AuditLogRepository,
  AuditLogFilter
} from '@audit-logs/audit-log.repository'
import { AuditLog, CreateAuditLogProps } from '@audit-logs/audit-log.entity'
import { AuditLogNotFoundError } from '@audit-logs/audit-log.errors'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'

@Injectable()
export class AuditLogService {
  constructor(private readonly repository: AuditLogRepository) {}

  async create(
    props: CreateAuditLogProps,
    ctx: RequestContext
  ): Promise<AuditLog> {
    // Automatically fill tenantImpersonationId when a PLATFORM user is impersonating
    const impersonatedTenantId =
      ctx.scope === UserScope.PLATFORM && 'impersonatedTenantId' in ctx
        ? (ctx as { impersonatedTenantId: string | null }).impersonatedTenantId
        : null

    // Auto-fill tenantId during impersonation (PLATFORM users have no tenantId of their own)
    // This prevents save() from throwing because getEffectiveTenantId(ctx) returns
    // the impersonated tenant ID, which must match auditLog.tenantId.
    const effectiveTenantId = impersonatedTenantId ?? props.tenantId

    const mergedProps: CreateAuditLogProps = {
      ...props,
      tenantId: effectiveTenantId,
    }

    const auditLog = AuditLog.create(mergedProps, impersonatedTenantId)
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
