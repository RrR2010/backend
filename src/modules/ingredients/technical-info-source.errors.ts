import { HttpException, HttpStatus } from '@nestjs/common'

export class TechnicalInfoSourceNotFoundError extends HttpException {
  constructor(id: string) {
    super(
      {
        message: `TechnicalInfoSource with id ${id} not found`,
        code: 'TECHNICAL_INFO_SOURCE_NOT_FOUND'
      },
      HttpStatus.NOT_FOUND
    )
  }
}
