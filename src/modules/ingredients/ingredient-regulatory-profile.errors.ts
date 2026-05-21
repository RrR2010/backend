import { HttpException, HttpStatus } from '@nestjs/common'

export class IngredientRegulatoryProfileNotFoundError extends HttpException {
  constructor(identifier: string) {
    super(
      {
        message: `Ingredient regulatory profile not found ${identifier}`,
        code: 'INGREDIENT_REGULATORY_PROFILE_NOT_FOUND'
      },
      HttpStatus.NOT_FOUND
    )
  }
}

export class IngredientRegulatoryProfileAlreadyExistsError extends HttpException {
  constructor(ingredientId: string, tenantId: string) {
    super(
      {
        message: `Ingredient regulatory profile already exists for ingredient ${ingredientId} in tenant ${tenantId}`,
        code: 'INGREDIENT_REGULATORY_PROFILE_ALREADY_EXISTS'
      },
      HttpStatus.CONFLICT
    )
  }
}
