import { HttpException, HttpStatus } from '@nestjs/common'

export class TenantNotFoundError extends HttpException {
  constructor(id?: string) {
    super(
      {
        message: id ? `Tenant with id ${id} not found` : 'Tenant not found',
        code: 'TENANT_NOT_FOUND'
      },
      HttpStatus.NOT_FOUND
    )
  }
}

export class TenantAlreadyExistsError extends HttpException {
  constructor(slug: string) {
    super(
      {
        message: `Tenant already exists with slug ${slug}`,
        code: 'TENANT_ALREADY_EXISTS'
      },
      HttpStatus.CONFLICT
    )
  }
}

export class TenantLockedError extends HttpException {
  constructor(id: string) {
    super(
      {
        message: `Tenant with id ${id} is locked and cannot be modified`,
        code: 'TENANT_LOCKED'
      },
      HttpStatus.LOCKED
    )
  }
}