import { HttpException, HttpStatus } from '@nestjs/common'

export class AllergenNotFoundError extends HttpException {
  constructor(id: string) {
    super(
      {
        message: `Allergen with id ${id} not found`,
        code: 'ALLERGEN_NOT_FOUND'
      },
      HttpStatus.NOT_FOUND
    )
  }
}

export class AllergenAlreadyExistsError extends HttpException {
  constructor(name: string, tenantId: string) {
    super(
      {
        message: `Allergen already exists with name '${name}' for tenant ${tenantId}`,
        code: 'ALLERGEN_ALREADY_EXISTS'
      },
      HttpStatus.CONFLICT
    )
  }
}
