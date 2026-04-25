/**
 * Role Types
 *
 * Discriminated union type that ties scope to the appropriate role.
 * Enforces mutual exclusivity between platform and tenant roles.
 *
 * Key Constraint (Mutual Exclusivity):
 * - A platform user can NEVER be a tenant user
 * - A tenant user can NEVER be a platform user
 * - The scope field determines which role type is valid
 *
 * Token Boundary Note:
 * - AuthTokenPayload uses `platformRoles?: string[]` (multi-role)
 * - This model supports single-role for authorization checks
 * - Use RoleAssignment.fromToken() to convert from token payload
 *
 * @example Platform role:
 *   { scope: AuthorizationScope.Platform, role: PlatformRole.ADMIN }
 *
 * @example Tenant role:
 *   { scope: AuthorizationScope.Tenant, role: TenantRole.ADMIN }
 */
import { AuthorizationScope } from './scope.enum';
import { PlatformRole } from './platform-role.enum';
import { TenantRole } from './tenant-role.enum';

/**
 * Platform-scoped role assignment
 * Used when scope === AuthorizationScope.Platform
 */
export interface PlatformRoleAssignment {
  scope: AuthorizationScope.Platform;
  role: PlatformRole;
}

/**
 * Tenant-scoped role assignment
 * Used when scope === AuthorizationScope.Tenant
 */
export interface TenantRoleAssignment {
  scope: AuthorizationScope.Tenant;
  role: TenantRole;
  tenantId: string;
}

/**
 * Discriminated union for single role assignment
 * The scope field determines which role type is valid
 *
 * Note: This represents ONE role assignment.
 * For token-based multi-role support, use RoleAssignment[] or extract from token.
 */
export type RoleAssignment = PlatformRoleAssignment | TenantRoleAssignment;

/**
 * Multi-role assignments from token
 * Represents all roles a user has in a given scope
 */
export type PlatformRoleAssignments = PlatformRoleAssignment[];
export type TenantRoleAssignments = TenantRoleAssignment[];

/**
 * RoleAssignment factory for token boundary
 * Converts from token payload (string arrays) to role assignments
 */
export const RoleAssignment = {
  /**
   * Create from token payload (platform scope)
   * Takes string array from token and returns role assignments
   */
  fromPlatformToken(platformRoles: string[], defaultRole = PlatformRole.USER): PlatformRoleAssignment[] {
    if (!platformRoles || platformRoles.length === 0) {
      return [{ scope: AuthorizationScope.Platform, role: defaultRole }];
    }
    return platformRoles.map(role => ({
      scope: AuthorizationScope.Platform,
      role: role as PlatformRole,
    }));
  },

  /**
   * Create from token payload (tenant scope)
   * Takes string array from token and returns role assignments
   */
  fromTenantToken(tenantRoles: string[], tenantId: string, defaultRole = TenantRole.USER): TenantRoleAssignment[] {
    if (!tenantRoles || tenantRoles.length === 0) {
      return [{ scope: AuthorizationScope.Tenant, role: defaultRole, tenantId }];
    }
    return tenantRoles.map(role => ({
      scope: AuthorizationScope.Tenant,
      role: role as TenantRole,
      tenantId,
    }));
  },

  /**
   * Create platform role assignment (single)
   */
  createPlatform(role: PlatformRole): PlatformRoleAssignment {
    return {
      scope: AuthorizationScope.Platform,
      role,
    };
  },

  /**
   * Create tenant role assignment (single)
   */
  createTenant(role: TenantRole, tenantId: string): TenantRoleAssignment {
    return {
      scope: AuthorizationScope.Tenant,
      role,
      tenantId,
    };
  },

  /**
   * Check if role assignment is platform-scoped
   */
  isPlatform(assignment: RoleAssignment): boolean {
    return assignment.scope === AuthorizationScope.Platform;
  },

  /**
   * Check if role assignment is tenant-scoped
   */
  isTenant(assignment: RoleAssignment): boolean {
    return assignment.scope === AuthorizationScope.Tenant;
  },
};

/**
 * Type alias for Role - canonical discriminated union
 *
 * @example Platform admin:
 *   { scope: AuthorizationScope.Platform, role: PlatformRole.ADMIN }
 *
 * @example Tenant admin:
 *   { scope: AuthorizationScope.Tenant, role: TenantRole.ADMIN, tenantId: 'tenant-123' }
 */
export type Role =
  | { scope: AuthorizationScope.Platform; role: PlatformRole }
  | { scope: AuthorizationScope.Tenant; role: TenantRole; tenantId: string };

/**
 * @deprecated Use RoleAssignment factory functions instead
 * Role const object kept for backward compatibility
 */
export const Role = {
  Platform: PlatformRole,
  Tenant: TenantRole,
} as const;

/**
 * Helper functions for Role types
 * @deprecated Use RoleAssignment instead
 */
export const RoleHelpers = {
  isPlatform(assignment: RoleAssignment): boolean {
    return RoleAssignment.isPlatform(assignment);
  },

  isTenant(assignment: RoleAssignment): boolean {
    return RoleAssignment.isTenant(assignment);
  },

  createPlatform(role: PlatformRole): PlatformRoleAssignment {
    return RoleAssignment.createPlatform(role);
  },

  createTenant(role: TenantRole, tenantId: string): TenantRoleAssignment {
    return RoleAssignment.createTenant(role, tenantId);
  },
};