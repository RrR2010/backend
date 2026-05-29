import { HttpException, HttpStatus } from '@nestjs/common'

export class AddressNotFoundError extends HttpException {
  constructor(id?: string) {
    super(
      {
        message: id ? `Address with id ${id} not found` : 'Address not found',
        code: 'ADDRESS_NOT_FOUND'
      },
      HttpStatus.NOT_FOUND
    )
  }
}
