import { HttpException, HttpStatus } from '@nestjs/common'

export class TechnicalSource_TENotFoundError extends HttpException {
  constructor(id: string) {
    super(
      {
        message: `TechnicalSource_TE with id ${id} not found`,
        code: 'TECHNICAL_SOURCE_TE_NOT_FOUND'
      },
      HttpStatus.NOT_FOUND
    )
  }
}
