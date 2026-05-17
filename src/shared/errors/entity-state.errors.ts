import { HttpException, HttpStatus } from '@nestjs/common'

// ============== GENERIC STATE ERRORS ==============
// These are used by the Lockable mixin behavior

export class EntityLockedError extends HttpException {
  constructor(entityType: string) {
    super(
      {
        message: `${entityType} is locked and cannot be modified`,
        code: 'ENTITY_LOCKED'
      },
      HttpStatus.FORBIDDEN
    )
  }
}

export class EntityDeletedError extends HttpException {
  constructor(entityType: string) {
    super(
      {
        message: `${entityType} has been deleted`,
        code: 'ENTITY_DELETED'
      },
      HttpStatus.GONE
    )
  }
}