import { HttpException, HttpStatus } from '@nestjs/common'

export class Allergen_PLNotFoundError extends HttpException {
  constructor() {
    super(
      {
        message: 'Resource not found or access denied',
        code: 'NOT_FOUND'
      },
      HttpStatus.NOT_FOUND
    )
  }
}

export class Allergen_PLAlreadyExistsError extends HttpException {
  constructor() {
    super(
      {
        message: 'Resource already exists',
        code: 'ALREADY_EXISTS'
      },
      HttpStatus.CONFLICT
    )
  }
}
