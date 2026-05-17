import { HttpException, HttpStatus } from '@nestjs/common'

// ============== STATE ERRORS ==============

export class UserAlreadyActiveError extends HttpException {
  constructor() {
    super(
      {
        message: 'User is already active',
        code: 'USER_ALREADY_ACTIVE'
      },
      HttpStatus.BAD_REQUEST
    )
  }
}

export class UserAlreadyInactiveError extends HttpException {
  constructor() {
    super(
      {
        message: 'User is already inactive',
        code: 'USER_ALREADY_INACTIVE'
      },
      HttpStatus.BAD_REQUEST
    )
  }
}

// ============== TYPE ERRORS ==============

export class UserTypeMismatchError extends HttpException {
  constructor(expectedType: string, actualType: string) {
    super(
      {
        message: `User type mismatch: expected ${expectedType}, got ${actualType}`,
        code: 'USER_TYPE_MISMATCH'
      },
      HttpStatus.BAD_REQUEST
    )
  }
}

export class CannotAddPlatformRoleToTenantUserError extends HttpException {
  constructor() {
    super(
      {
        message: 'Cannot add platform role to tenant user',
        code: 'CANNOT_ADD_PLATFORM_ROLE_TO_TENANT_USER'
      },
      HttpStatus.BAD_REQUEST
    )
  }
}

export class CannotAddTenantRoleToPlatformUserError extends HttpException {
  constructor() {
    super(
      {
        message: 'Cannot add tenant role to platform user',
        code: 'CANNOT_ADD_TENANT_ROLE_TO_PLATFORM_USER'
      },
      HttpStatus.BAD_REQUEST
    )
  }
}

// ============== TENANT ERRORS ==============

export class TenantUserWithoutTenantIdError extends HttpException {
  constructor() {
    super(
      {
        message: 'Tenant user must have a tenantId',
        code: 'TENANT_USER_WITHOUT_TENANT_ID'
      },
      HttpStatus.BAD_REQUEST
    )
  }
}

export class PlatformUserWithTenantIdError extends HttpException {
  constructor() {
    super(
      {
        message: 'Platform user cannot have a tenantId',
        code: 'PLATFORM_USER_WITH_TENANT_ID'
      },
      HttpStatus.BAD_REQUEST
    )
  }
}

export class UserNotInTenantError extends HttpException {
  constructor(userId: string, tenantId: string) {
    super(
      {
        message: `User ${userId} is not a member of tenant ${tenantId}`,
        code: 'USER_NOT_IN_TENANT'
      },
      HttpStatus.FORBIDDEN
    )
  }
}

// ============== NOT FOUND ==============

export class UserNotFoundError extends HttpException {
  constructor(userId?: string) {
    super(
      {
        message: userId ? `User with id ${userId} not found` : 'User not found',
        code: 'USER_NOT_FOUND'
      },
      HttpStatus.NOT_FOUND
    )
  }
}
