import { HttpException, HttpStatus } from '@nestjs/common'

export class TenantNutrientNotFoundError extends HttpException {
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

export class TenantNutrientMissingTenantIdError extends HttpException {
  constructor() {
    super(
      {
        message: 'Tenant ID é obrigatório para criar um nutriente. Selecione um tenant primeiro.',
        code: 'TENANT_NUTRIENT_MISSING_TENANT_ID'
      },
      HttpStatus.BAD_REQUEST
    )
  }
}
