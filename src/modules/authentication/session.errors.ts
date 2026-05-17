import { HttpException, HttpStatus } from '@nestjs/common'

export class SessionNotFoundError extends HttpException {
  constructor(id?: string) {
    super(
      {
        message: id ? `Session with id ${id} not found` : 'Session not found',
        code: 'SESSION_NOT_FOUND'
      },
      HttpStatus.NOT_FOUND
    )
  }
}

export class SessionExpiredError extends HttpException {
  constructor(id: string) {
    super(
      {
        message: `Session with id ${id} has expired`,
        code: 'SESSION_EXPIRED'
      },
      HttpStatus.UNAUTHORIZED
    )
  }
}

export class SessionRevokedError extends HttpException {
  constructor(id: string) {
    super(
      {
        message: `Session with id ${id} has been revoked`,
        code: 'SESSION_REVOKED'
      },
      HttpStatus.UNAUTHORIZED
    )
  }
}
