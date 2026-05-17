import { HttpException, HttpStatus } from '@nestjs/common'

export class InvalidCredentialsError extends HttpException {
  constructor() {
    super(
      {
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      },
      HttpStatus.UNAUTHORIZED
    )
  }
}

// Error for when the an Platform user tries to select tenant
export class InvalidScopeError extends HttpException {
  constructor() {
    super(
      {
        message: 'Invalid scope',
        code: 'INVALID_SCOPE'
      },
      HttpStatus.UNAUTHORIZED
    )
  }
}

// Error for when the selected tenant has no membership related to the user that is trying to select it
export class TenantNotFoundError extends HttpException {
  constructor() {
    super(
      {
        message: 'Tenant not found',
        code: 'TENANT_NOT_FOUND'
      },
      HttpStatus.NOT_FOUND
    )
  }
}

export class SessionNotFoundError extends HttpException {
  constructor() {
    super(
      {
        message: 'Session not found',
        code: 'SESSION_NOT_FOUND'
      },
      HttpStatus.NOT_FOUND
    )
  }
}

export class RefreshTokenExpiredError extends HttpException {
  constructor() {
    super(
      {
        message: 'Refresh token expired',
        code: 'REFRESH_TOKEN_EXPIRED'
      },
      HttpStatus.UNAUTHORIZED
    )
  }
}

export class UserNotFoundAfterAuthenticationError extends HttpException {
  constructor() {
    super(
      {
        message: 'User not found after authentication - invariant violation',
        code: 'USER_NOT_FOUND_AFTER_AUTHENTICATION'
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    )
  }
}
