/**
 * AuthorizationScope Enum
 *
 * Defines the scope of authorization context.
 * This determines whether the current session is at the platform level or tenant level.
 *
 * Canonical Definitions:
 * - Platform: Global/system-wide context (SaaS company staff)
 * - Tenant: Organization-scoped context (client users)
 *
 * Key Constraint (Mutual Exclusivity):
 * - A platform user can NEVER be a tenant user
 * - A tenant user can NEVER be a platform user
 * - These are mutually exclusive identities
 *
 * Used by:
 * - Auth token payload (AuthTokenPayload.scope)
 * - Authorization guards
 * - Role type discriminator
 *
 * @deprecated Import `AuthScope` from `@modules/authentication/domain/token.service` for consistency with auth payload.
 * This enum is kept for new authorization code. Use `AuthorizationScopeToAuthScope()` to convert.
 */
export enum AuthorizationScope {
  Platform = 'platform',
  Tenant = 'tenant',
}

/**
 * Alias for AuthScope from token service (for naming consistency with auth payloads)
 * Use this when you need to match the auth token's field naming.
 */
export type AuthScope = 'platform' | 'tenant';

/**
 * Convert AuthorizationScope to AuthScope string
 */
export function AuthorizationScopeToAuthScope(scope: AuthorizationScope): AuthScope {
  return scope as AuthScope;
}

/**
 * Convert AuthScope string to AuthorizationScope
 */
export function AuthScopeToAuthorizationScope(scope: AuthScope): AuthorizationScope {
  return scope as AuthorizationScope;
}

/**
 * Helper functions for AuthorizationScope
 */
export const AuthorizationScopeHelpers = {
  /**
   * Check if scope is valid
   */
  isValid(scope: string): boolean {
    return scope === AuthorizationScope.Platform || scope === AuthorizationScope.Tenant;
  },

  /**
   * Check if scope is platform
   */
  isPlatform(scope: AuthorizationScope | AuthScope): boolean {
    return scope === AuthorizationScope.Platform || scope === 'platform';
  },

  /**
   * Check if scope is tenant
   */
  isTenant(scope: AuthorizationScope | AuthScope): boolean {
    return scope === AuthorizationScope.Tenant || scope === 'tenant';
  },

  /**
   * Get the opposite scope (for validation)
   */
  opposite(scope: AuthorizationScope): AuthorizationScope {
    return scope === AuthorizationScope.Platform
      ? AuthorizationScope.Tenant
      : AuthorizationScope.Platform;
  },
};