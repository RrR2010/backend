import { HttpException, HttpStatus } from '@nestjs/common'

export class NutrientNotFoundError extends HttpException {
  constructor(id: string) {
    super(
      {
        message: `Nutrient with id ${id} not found`,
        code: 'NUTRIENT_NOT_FOUND'
      },
      HttpStatus.NOT_FOUND
    )
  }
}

export class NutrientAlreadyExistsError extends HttpException {
  constructor(name: string, tenantId: string) {
    super(
      {
        message: `Nutrient already exists with name '${name}' for tenant ${tenantId}`,
        code: 'NUTRIENT_ALREADY_EXISTS'
      },
      HttpStatus.CONFLICT
    )
  }
}
