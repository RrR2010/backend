import { HttpException, HttpStatus } from '@nestjs/common'

export class IngredientNotFoundError extends HttpException {
  constructor(id: string) {
    super(
      {
        message: `Ingredient with id ${id} not found`,
        code: 'INGREDIENT_NOT_FOUND'
      },
      HttpStatus.NOT_FOUND
    )
  }
}

export class IngredientAlreadyExistsError extends HttpException {
  constructor(code: string, tenantId: string) {
    super(
      {
        message: `Ingredient already exists with code '${code}' for tenant ${tenantId}`,
        code: 'INGREDIENT_ALREADY_EXISTS'
      },
      HttpStatus.CONFLICT
    )
  }
}
