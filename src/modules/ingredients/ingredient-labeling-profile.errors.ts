import { HttpException, HttpStatus } from '@nestjs/common'

export class IngredientLabelingProfileNotFoundError extends HttpException {
  constructor(identifier: string) {
    super(
      {
        message: `Ingredient labeling profile not found ${identifier}`,
        code: 'INGREDIENT_LABELING_PROFILE_NOT_FOUND'
      },
      HttpStatus.NOT_FOUND
    )
  }
}

export class IngredientLabelingProfileAlreadyExistsError extends HttpException {
  constructor(ingredientId: string, tenantId: string) {
    super(
      {
        message: `Ingredient labeling profile already exists for ingredient ${ingredientId} in tenant ${tenantId}`,
        code: 'INGREDIENT_LABELING_PROFILE_ALREADY_EXISTS'
      },
      HttpStatus.CONFLICT
    )
  }
}
