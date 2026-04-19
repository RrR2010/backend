import { DomainError } from '@core/domain/domain-error';

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('Invalid credentials', 'INVALID_CREDENTIALS');
  }
}

export class InvalidOrExpiredPreAuthTokenError extends DomainError {
  constructor() {
    super('Invalid or expired pre-auth token', 'INVALID_PRE_AUTH_TOKEN');
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
