import { HttpException, HttpStatus } from '@nestjs/common'

export class BaseNutrientNotFoundError extends HttpException {
  constructor(id: string) {
    super(
      {
        message: `Base nutrient with id ${id} not found`,
        code: 'BASE_NUTRIENT_NOT_FOUND'
      },
      HttpStatus.NOT_FOUND
    )
  }
}

export class BaseNutrientAlreadyExistsError extends HttpException {
  constructor(name: string) {
    super(
      {
        message: `Base nutrient already exists with name ${name}`,
        code: 'BASE_NUTRIENT_ALREADY_EXISTS'
      },
      HttpStatus.CONFLICT
    )
  }
}
