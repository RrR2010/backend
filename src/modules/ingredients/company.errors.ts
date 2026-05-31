import { HttpException, HttpStatus } from '@nestjs/common'

export class CompanyNotFoundError extends HttpException {
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

export class CompanyAlreadyExistsError extends HttpException {
  constructor(taxId: string, tenantId: string) {
    super(
      {
        message: `Company already exists with taxId '${taxId}' for tenant ${tenantId}`,
        code: 'COMPANY_ALREADY_EXISTS'
      },
      HttpStatus.CONFLICT
    )
  }
}
