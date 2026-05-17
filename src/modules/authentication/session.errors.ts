import { HttpException, HttpStatus } from '@nestjs/common'

export class SessionNotFoundError extends HttpException {
  constructor() {
    super(
      {
        message: 'Session not found',
        code: 'SESSION_NOT_FOUND'
      },
      HttpStatus.NOT_FOUND
    )
  }
}

export class SessionExpiredError extends HttpException {
  constructor() {
    super(
      {
        message: 'Session has expired',
        code: 'SESSION_EXPIRED'
      },
      HttpStatus.UNAUTHORIZED
    )
  }
}

export class SessionRevokedError extends HttpException {
  constructor() {
    super(
      {
        message: 'Session has been revoked',
        code: 'SESSION_REVOKED'
      },
      HttpStatus.UNAUTHORIZED
    )
  }
}
