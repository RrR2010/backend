import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import {
  AuditLogResponseDto,
  AuditLogFilterDto
} from '@audit-logs/audit-log.dto'
import { AuditLogService } from '@audit-logs/audit-log.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { AuditLog } from '@audit-logs/audit-log.entity'

@ApiTags('Audit Logs')
@ApiBearerAuth('accessToken')
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly service: AuditLogService) {}

  @Get()
  @Authorize(Action.Read, 'AuditLog')
  async findAll(
    @Query() filter?: AuditLogFilterDto
  ): Promise<AuditLogResponseDto[]> {
    const logs = await this.service.findAll(filter ?? undefined, null as any)
    return logs.map(AuditLogResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, 'AuditLog')
  async findById(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<AuditLogResponseDto> {
    const log = await this.service.findById(id, null as any)
    return AuditLogResponseDto.fromDomain(log)
  }
}