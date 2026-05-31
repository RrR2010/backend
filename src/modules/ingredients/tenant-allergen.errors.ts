import { HttpException, HttpStatus } from '@nestjs/common'

export class TenantAllergenNotFoundError extends HttpException {
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
