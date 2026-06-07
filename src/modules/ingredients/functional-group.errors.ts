import { HttpException, HttpStatus } from '@nestjs/common'

export class FunctionalGroupNotFoundError extends HttpException {
  constructor(_id?: string) {
    super(
      {
        message: 'Resource not found or access denied',
        code: 'NOT_FOUND'
      },
      HttpStatus.NOT_FOUND
    )
  }
}

export class FunctionalGroupAlreadyExistsError extends HttpException {
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
