import { HttpException, HttpStatus } from '@nestjs/common'

export class TenantSiteNotFoundError extends HttpException {
  constructor(id?: string) {
    super(
      {
        message: id
          ? `Tenant site with id ${id} not found`
          : 'Tenant site not found',
        code: 'TENANT_SITE_NOT_FOUND'
      },
      HttpStatus.NOT_FOUND
    )
  }
}

export class TenantSiteAlreadyExistsError extends HttpException {
  constructor(tenantId: string, slug: string) {
    super(
      {
        message: `Tenant site already exists for tenant ${tenantId} with slug ${slug}`,
        code: 'TENANT_SITE_ALREADY_EXISTS'
      },
      HttpStatus.CONFLICT
    )
  }
}

export class TenantSiteLockedError extends HttpException {
  constructor(id: string) {
    super(
      {
        message: `Tenant site with id ${id} is locked and cannot be modified`,
        code: 'TENANT_SITE_LOCKED'
      },
      HttpStatus.LOCKED
    )
  }
}
