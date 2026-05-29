import { HttpException, HttpStatus } from '@nestjs/common'

export class TenantNutrientNotFoundError extends HttpException {
  constructor(id: string) {
    super(
      {
        message: `TenantNutrient with id ${id} not found`,
        code: 'TENANT_NUTRIENT_NOT_FOUND'
      },
      HttpStatus.NOT_FOUND
    )
  }
}

export class TenantNutrientAlreadyExistsError extends HttpException {
  constructor(name: string, tenantId: string) {
    super(
      {
        message: `TenantNutrient already exists with name '${name}' for tenant ${tenantId}`,
        code: 'TENANT_NUTRIENT_ALREADY_EXISTS'
      },
      HttpStatus.CONFLICT
    )
  }
}
