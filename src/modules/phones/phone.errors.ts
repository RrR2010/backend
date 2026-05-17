import { HttpException, HttpStatus } from '@nestjs/common'

export class PhoneNotFoundError extends HttpException {
  constructor(id?: string) {
    super(
      {
        message: id ? `Phone with id ${id} not found` : 'Phone not found',
        code: 'PHONE_NOT_FOUND'
      },
      HttpStatus.NOT_FOUND
    )
  }
}