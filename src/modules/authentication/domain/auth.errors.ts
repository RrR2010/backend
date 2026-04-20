import { DomainError } from '@core/domain/domain-error';
import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidCredentialsError extends HttpException {
  constructor() {
    super(
      {
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class InvalidOrExpiredPreAuthTokenError extends HttpException {
  constructor() {
    super(
      {
        message: 'Invalid or expired pre-auth token',
        code: 'INVALID_PRE_AUTH_TOKEN',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class InvalidOrExpiredAccessTokenError extends HttpException {
  constructor() {
    super(
      {
        message: 'Invalid or expired access token',
        code: 'INVALID_ACCESS_TOKEN',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class UserHasNoMembershipsError extends DomainError {
  constructor() {
    super('User has no memberships', 'USER_HAS_NO_MEMBERSHIPS');
  }
}

export class UserDoesNotHaveAccessToTenantError extends DomainError {
  constructor() {
    super('User does not have access to this tenant', 'TENANT_ACCESS_DENIED');
  }
}

export class MissingTenantContextError extends DomainError {
  constructor() {
    super(
      'Tenant context is required to access this resource',
      'MISSING_TENANT_CONTEXT',
    );
  }
}

export class InvalidOrExpiredRefreshTokenError extends HttpException {
  constructor() {
    super(
      {
        message: 'Invalid or expired refresh token',
        code: 'INVALID_REFRESH_TOKEN',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
