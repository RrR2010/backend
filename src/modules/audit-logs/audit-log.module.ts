import { Module } from '@nestjs/common'

import { AuditLogRepository, PrismaAuditLogRepository } from '@audit-logs/audit-log.repository'
import { AuditLogService } from '@audit-logs/audit-log.service'
import { AuditLogsController } from '@audit-logs/audit-log.controller'

@Module({
  imports: [],

  controllers: [AuditLogsController],

  providers: [
    AuditLogService,
    PrismaAuditLogRepository,
    {
      provide: AuditLogRepository,
      useExisting: PrismaAuditLogRepository
    }
  ],

  exports: [AuditLogRepository, AuditLogService]
})
export class AuditLogModule {}