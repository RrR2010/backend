/**
 * AbilityFactoryInput Type
 *
 * Defines the input shape consumed by the ability factory.
 * This type encapsulates all authorization-relevant data from a request.
 *
 * Used by:
 * - Authorization guards to pass context to the factory
 * - Services that need inline permission checks
 *
 * @example Platform user:
 *   {
 *     userId: 'user-123',
 *     scope: AuthorizationScope.Platform,
 *     platformRoles: [PlatformRole.ADMIN],
 *   }
 *
 * @example Tenant user with membership:
 *   {
 *     userId: 'user-456',
 *     scope: AuthorizationScope.Tenant,
 *     membership: { tenantId: 'tenant-789', roles: [TenantRole.ADMIN] },
 *   }
 */
import { AuthorizationScope, PlatformRole, TenantRole } from '@core/domain/authorization';

/**
 * Tenant membership data
 * Represents the user's membership within a tenant
 */
export interface MembershipInput {
  /** The tenant ID this membership belongs to */
  tenantId: string;

  /** The roles the user has within this tenant */
  roles: TenantRole[];
}

/**
 * ResourceAttributes for permission conditions
 */
export interface ResourceAttributes {
  /** Resource owner user ID (for ownership checks) */
  ownerId?: string;

  /** Resource tenant ID (for tenant boundary checks) */
  tenantId?: string;

  /** Additional resource-specific attributes */
  [key: string]: unknown;
}

/**
 * AbilityFactoryInput
 *
 * Complete input for building CASL abilities.
 * Encapsulates identity, scope, roles, and resource context.
 */
export interface AbilityFactoryInput {
  /** User ID from auth token */
  userId: string;

  /** Authorization scope (platform or tenant) */
  scope: AuthorizationScope;

  /** Platform roles (for platform-scoped requests) */
  platformRoles?: PlatformRole[];

  /** Tenant membership (for tenant-scoped requests) */
  membership?: MembershipInput;

  /** Resource attributes for ABAC conditions */
  resource?: ResourceAttributes;
}

/**
 * Convert AbilityFactoryInput to AuthorizationContext for backward compatibility
 */
export function toAuthorizationContext(input: AbilityFactoryInput): {
  request: { userId: string; scope: AuthorizationScope; roles: unknown; allRoles?: unknown[] };
  resource?: ResourceAttributes;
} {
  const context: any = {
    request: {
      userId: input.userId,
      scope: input.scope,
    },
  };

  if (input.scope === AuthorizationScope.Platform && input.platformRoles) {
    const allRoles = input.platformRoles.map(role => ({
      scope: AuthorizationScope.Platform,
      role,
    }));
    context.request.roles = allRoles[0];
    context.request.allRoles = allRoles;
  } else if (input.membership) {
    const allRoles = input.membership.roles.map(role => ({
      scope: AuthorizationScope.Tenant,
      role,
      tenantId: input.membership!.tenantId,
    }));
    context.request.roles = allRoles[0];
    context.request.allRoles = allRoles;
  }

  if (input.resource) {
    context.resource = input.resource;
  }

  return context;
}