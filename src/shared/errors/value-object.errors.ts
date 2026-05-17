import { HttpException, HttpStatus } from '@nestjs/common'

// ============== VALUE OBJECT ERRORS ==============

export class InvalidUuidError extends HttpException {
  constructor() {
    super(
      {
        message: 'Invalid UUID format',
        code: 'INVALID_UUID'
      },
      HttpStatus.BAD_REQUEST
    )
  }
}

export class EmailEmptyError extends HttpException {
  constructor() {
    super(
      {
        message: 'Email cannot be empty',
        code: 'EMAIL_EMPTY'
      },
      HttpStatus.BAD_REQUEST
    )
  }
}

export class EmailFormatError extends HttpException {
  constructor() {
    super(
      {
        message: 'Invalid email format',
        code: 'EMAIL_FORMAT_INVALID'
      },
      HttpStatus.BAD_REQUEST
    )
  }
}

export class InvalidEnvValueError extends HttpException {
  constructor(value: string) {
    super(
      {
        message: `Invalid environment value: "${value}". Expected number (ms) or ms string (e.g., "15m", "7d").`,
        code: 'INVALID_ENV_VALUE'
      },
      HttpStatus.BAD_REQUEST
    )
  }
}