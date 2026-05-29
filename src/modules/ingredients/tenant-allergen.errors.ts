import { HttpException, HttpStatus } from '@nestjs/common'

export class TenantAllergenNotFoundError extends HttpException {
  constructor(id: string) {
    super(
      {
        message: `TenantAllergen with id ${id} not found`,
        code: 'TENANT_ALLERGEN_NOT_FOUND'
      },
      HttpStatus.NOT_FOUND
    )
  }
}

export class TenantAllergenAlreadyExistsError extends HttpException {
  constructor(name: string, tenantId: string) {
    super(
      {
        message: `TenantAllergen already exists with name '${name}' for tenant ${tenantId}`,
        code: 'TENANT_ALLERGEN_ALREADY_EXISTS'
      },
      HttpStatus.CONFLICT
    )
  }
}
