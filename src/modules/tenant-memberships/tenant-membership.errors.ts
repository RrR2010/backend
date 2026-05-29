import { HttpException, HttpStatus } from '@nestjs/common'

export class TenantMembershipNotFoundError extends HttpException {
  constructor(id?: string) {
    super(
      {
        message: id
          ? `Tenant membership with id ${id} not found`
          : 'Tenant membership not found',
        code: 'TENANT_MEMBERSHIP_NOT_FOUND'
      },
      HttpStatus.NOT_FOUND
    )
  }
}

export class TenantMembershipAlreadyExistsError extends HttpException {
  constructor(userId: string, tenantId: string, role: string) {
    super(
      {
        message: `Tenant membership already exists for user ${userId} in tenant ${tenantId} with role ${role}`,
        code: 'TENANT_MEMBERSHIP_ALREADY_EXISTS'
      },
      HttpStatus.CONFLICT
    )
  }
}

export class TenantMembershipLockedError extends HttpException {
  constructor(id: string) {
    super(
      {
        message: `Tenant membership with id ${id} is locked and cannot be modified`,
        code: 'TENANT_MEMBERSHIP_LOCKED'
      },
      HttpStatus.LOCKED
    )
  }
}
