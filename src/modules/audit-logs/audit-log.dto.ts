import { ApiProperty } from '@nestjs/swagger'
import { AuditLog } from '@audit-logs/audit-log.entity'

export class CreateAuditLogDto {
  @ApiProperty({ required: false })
  userId?: string

  @ApiProperty({ required: false })
  tenantId?: string

  @ApiProperty({ type: String })
  entityName!: string

  @ApiProperty({ type: String })
  entityId!: string

  @ApiProperty({ required: false })
  ipAddress?: string

  @ApiProperty({ required: false })
  userAgent?: string

  @ApiProperty({ type: String })
  action!: string

  @ApiProperty({ required: false })
  before?: Record<string, unknown>

  @ApiProperty({ required: false })
  after?: Record<string, unknown>
}

export class CreateAuditLogResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty({ required: false, nullable: true })
  userId?: string | null

  @ApiProperty({ required: false, nullable: true })
  tenantId?: string | null

  @ApiProperty()
  entityName!: string

  @ApiProperty()
  entityId!: string

  @ApiProperty({ required: false, nullable: true })
  ipAddress?: string | null

  @ApiProperty({ required: false, nullable: true })
  userAgent?: string | null

  @ApiProperty()
  action!: string

  @ApiProperty({ required: false, nullable: true })
  before?: Record<string, unknown> | null

  @ApiProperty({ required: false, nullable: true })
  after?: Record<string, unknown> | null

  @ApiProperty()
  createdAt!: Date

  static fromDomain(log: AuditLog): CreateAuditLogResponseDto {
    return {
      id: log.id.value,
      userId: log.userId,
      tenantId: log.tenantId,
      entityName: log.entityName,
      entityId: log.entityId,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      action: log.action,
      before: log.before,
      after: log.after,
      createdAt: log.createdAt
    }
  }
}

export class AuditLogResponseDto extends CreateAuditLogResponseDto {}

export class AuditLogFilterDto {
  @ApiProperty({ required: false })
  userId?: string

  @ApiProperty({ required: false })
  tenantId?: string

  @ApiProperty({ required: false })
  entityName?: string

  @ApiProperty({ required: false })
  entityId?: string

  @ApiProperty({ required: false })
  action?: string

  @ApiProperty({ required: false })
  createdAfter?: Date

  @ApiProperty({ required: false })
  createdBefore?: Date
}