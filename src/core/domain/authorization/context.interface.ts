/**
 * AuthorizationContext Interface
 *
 * Separates request context (who is making the request) from resource attributes
 * (what the resource looks like). This separation keeps ABAC conditions readable.
 *
 * Used by:
 * - Authorization guards
 * - Permission checks in services
 * - ABAC conditions
 *
 * Token Boundary Note:
 * - AuthTokenPayload uses `platformRoles?: string[]` (multi-role)
 * - This context uses single RoleAssignment for authorization checks
 * - Use `AuthorizationContextHelpers.fromTokenPayload()` to convert from token
 *
 * @example Platform user request:
 *   {
 *     userId: 'user-123',
 *     scope: AuthorizationScope.Platform,
 *     roles: { scope: AuthorizationScope.Platform, role: PlatformRole.ADMIN }
 *   }
 *
 * @example Tenant user request:
 *   {
 *     userId: 'user-456',
 *     scope: AuthorizationScope.Tenant,
 *     roles: { scope: AuthorizationScope.Tenant, role: TenantRole.ADMIN, tenantId: 'tenant-789' }
 *   }
 */
import { AuthorizationScope, AuthScope } from './scope.enum';
import { PlatformRole } from './platform-role.enum';
import { TenantRole } from './tenant-role.enum';
import { RoleAssignment, PlatformRoleAssignment, TenantRoleAssignment } from './role.types';
import { AuthTokenPayload } from '@modules/authentication/domain/token.service';

/**
 * Request context (who is making the request)
 * This is extracted from the auth token
 */
export interface RequestContext {
  /** User ID from auth token */
  userId: string;

  /** Authorization scope (platform or tenant) - matches AuthTokenPayload.scope naming */
  scope: AuthorizationScope | AuthScope;

  /** Role assignment based on scope */
  roles: RoleAssignment;

  /** All roles (for multi-role authorization checks) */
  allRoles?: RoleAssignment[];

  /** JWT ID for token revocation tracking */
  jti?: string;
}

/**
 * Resource attributes (what the resource looks like)
 * Used for ABAC conditions
 */
export interface ResourceAttributes {
  /** Resource owner user ID */
  ownerId?: string;

  /** Resource tenant ID (for tenant-scoped resources) */
  tenantId?: string;

  /** Additional resource-specific attributes */
  [key: string]: unknown;
}

/**
 * AuthorizationContext
 * Combines request context with resource attributes for permission checks
 */
export interface AuthorizationContext {
  /** Request context (who is making the request) */
  request: RequestContext;

  /** Resource attributes (what the resource looks like) */
  resource?: ResourceAttributes;
}

/**
 * Helper functions for AuthorizationContext
 */
export const AuthorizationContextHelpers = {
  /**
   * Create a platform request context
   */
  createPlatformContext(
    userId: string,
    role: PlatformRole,
    jti?: string,
  ): AuthorizationContext {
    const context: AuthorizationContext = {
      request: {
        userId,
        scope: AuthorizationScope.Platform,
        roles: {
          scope: AuthorizationScope.Platform,
          role,
        },
      },
    };
    if (jti) {
      context.request.jti = jti;
    }
    return context;
  },

  /**
   * Create a tenant request context
   */
  createTenantContext(
    userId: string,
    role: TenantRole,
    tenantId: string,
    jti?: string,
  ): AuthorizationContext {
    const context: AuthorizationContext = {
      request: {
        userId,
        scope: AuthorizationScope.Tenant,
        roles: {
          scope: AuthorizationScope.Tenant,
          role,
          tenantId,
        },
      },
    };
    if (jti) {
      context.request.jti = jti;
    }
    return context;
  },

  /**
   * Create from AuthTokenPayload (token boundary conversion)
   * Converts from the string-based token format to typed context
   *
   * @param payload - Raw token payload with string roles
   * @returns AuthorizationContext with typed roles
   */
  fromTokenPayload(payload: AuthTokenPayload): AuthorizationContext {
    const scope = payload.scope;
    const isPlatformScope = scope === 'platform';

    if (isPlatformScope) {
      // Platform scope: use platformRoles from token
      const platformRoles = payload.platformRoles || ['USER'];
      const allRoles: PlatformRoleAssignment[] = platformRoles.map(role => ({
        scope: AuthorizationScope.Platform,
        role: role as PlatformRole,
      }));
      // Primary role is the first one (for backward compatibility)
      const primaryRole = allRoles[0];

      return {
        request: {
          userId: payload.sub,
          scope: AuthorizationScope.Platform,
          roles: primaryRole,
          allRoles,
          jti: payload.jti,
        },
      };
    } else {
      // Tenant scope: roles come from membership (not in token)
      // For now, use default USER role (would be loaded from membership in real impl)
      const tenantId = payload.tenantId || '';
      const allRoles: TenantRoleAssignment[] = [
        {
          scope: AuthorizationScope.Tenant,
          role: TenantRole.USER,
          tenantId,
        },
      ];

      return {
        request: {
          userId: payload.sub,
          scope: AuthorizationScope.Tenant,
          roles: allRoles[0],
          allRoles,
          jti: payload.jti,
        },
      };
    }
  },

  /**
   * Check if request is platform-scoped
   */
  isPlatform(ctx: AuthorizationContext): boolean {
    return ctx.request.scope === AuthorizationScope.Platform || ctx.request.scope === 'platform';
  },

  /**
   * Check if request is tenant-scoped
   */
  isTenant(ctx: AuthorizationContext): boolean {
    return ctx.request.scope === AuthorizationScope.Tenant || ctx.request.scope === 'tenant';
  },

  /**
   * Check if user has any of the given roles
   * Useful for multi-role authorization
   */
  hasAnyRole(ctx: AuthorizationContext, roles: PlatformRole[] | TenantRole[]): boolean {
    const allRoles = ctx.request.allRoles || [ctx.request.roles];
    return allRoles.some(ar => roles.includes(ar.role as any));
  },
};