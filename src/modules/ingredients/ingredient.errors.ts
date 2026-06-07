import { HttpException, HttpStatus } from '@nestjs/common'

export class IngredientNotFoundError extends HttpException {
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

export class IngredientAlreadyExistsError extends HttpException {
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
