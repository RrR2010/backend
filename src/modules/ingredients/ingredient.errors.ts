import { HttpException, HttpStatus } from '@nestjs/common'

export class IngredientNotFoundError extends HttpException {
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
