import { HttpException, HttpStatus } from '@nestjs/common'

export class BaseAllergenNotFoundError extends HttpException {
  constructor(id: string) {
    super(
      {
        message: `Base allergen with id ${id} not found`,
        code: 'BASE_ALLERGEN_NOT_FOUND'
      },
      HttpStatus.NOT_FOUND
    )
  }
}

export class BaseAllergenAlreadyExistsError extends HttpException {
  constructor(name: string) {
    super(
      {
        message: `Base allergen already exists with name ${name}`,
        code: 'BASE_ALLERGEN_ALREADY_EXISTS'
      },
      HttpStatus.CONFLICT
    )
  }
}
