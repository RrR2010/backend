import { HttpException, HttpStatus } from '@nestjs/common'

export class AuditLogNotFoundError extends HttpException {
  constructor(id?: string) {
    super(
      {
        message: id
          ? `Audit log with id ${id} not found`
          : 'Audit log not found',
        code: 'AUDIT_LOG_NOT_FOUND'
      },
      HttpStatus.NOT_FOUND
    )
  }
}
