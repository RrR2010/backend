import { HttpException, HttpStatus } from '@nestjs/common'

export class IngredientTechnicalProfileNotFoundError extends HttpException {
  constructor(identifier: string) {
    super(
      {
        message: `Ingredient technical profile not found ${identifier}`,
        code: 'INGREDIENT_TECHNICAL_PROFILE_NOT_FOUND'
      },
      HttpStatus.NOT_FOUND
    )
  }
}

export class IngredientTechnicalProfileAlreadyExistsError extends HttpException {
  constructor(ingredientId: string, tenantId: string) {
    super(
      {
        message: `Ingredient technical profile already exists for ingredient ${ingredientId} in tenant ${tenantId}`,
        code: 'INGREDIENT_TECHNICAL_PROFILE_ALREADY_EXISTS'
      },
      HttpStatus.CONFLICT
    )
  }
}
