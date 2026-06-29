import { HttpException, HttpStatus } from '@nestjs/common'

export class FormulationRegulatoryDeclaration_TENotFoundError extends HttpException {
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
