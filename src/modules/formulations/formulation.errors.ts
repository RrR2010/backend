import { HttpException, HttpStatus } from '@nestjs/common'

export class FormulationVersion_TENotFoundError extends HttpException {
  constructor() {
    super({ message: 'Resource not found or access denied', code: 'NOT_FOUND' }, HttpStatus.NOT_FOUND)
  }
}

export class FormulationRevision_TENotFoundError extends HttpException {
  constructor() {
    super({ message: 'Resource not found or access denied', code: 'NOT_FOUND' }, HttpStatus.NOT_FOUND)
  }
}

export class FormulationItem_TENotFoundError extends HttpException {
  constructor() {
    super({ message: 'Resource not found or access denied', code: 'NOT_FOUND' }, HttpStatus.NOT_FOUND)
  }
}
