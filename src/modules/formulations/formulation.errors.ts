import { HttpException, HttpStatus } from '@nestjs/common'

export class FormulationVersionNotFoundError extends HttpException {
  constructor() {
    super({ message: 'Resource not found or access denied', code: 'NOT_FOUND' }, HttpStatus.NOT_FOUND)
  }
}

export class FormulationRevisionNotFoundError extends HttpException {
  constructor() {
    super({ message: 'Resource not found or access denied', code: 'NOT_FOUND' }, HttpStatus.NOT_FOUND)
  }
}

export class FormulationItemNotFoundError extends HttpException {
  constructor() {
    super({ message: 'Resource not found or access denied', code: 'NOT_FOUND' }, HttpStatus.NOT_FOUND)
  }
}
