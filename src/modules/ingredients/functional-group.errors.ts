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
  constructor(name: string, tenantId: string) {
    super(
      {
        message: `FunctionalGroup already exists with name '${name}' for tenant ${tenantId}`,
        code: 'FUNCTIONAL_GROUP_ALREADY_EXISTS'
      },
      HttpStatus.CONFLICT
    )
  }
}
