import { HttpException, HttpStatus } from '@nestjs/common'

export class Regulation_PLNotFoundError extends HttpException {
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
