import { HttpException, HttpStatus } from '@nestjs/common'

export class CompanyNotFoundError extends HttpException {
  constructor(id: string) {
    super(
      {
        message: `Company with id ${id} not found`,
        code: 'COMPANY_NOT_FOUND'
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
