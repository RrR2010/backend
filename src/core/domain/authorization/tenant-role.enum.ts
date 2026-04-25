/**
 * TenantRole Enum
 *
 * Represents roles within a specific tenant context.
 * These roles are assigned to users via Membership entities.
 *
 * Canonical Definitions:
 * - OWNER: Tenant owner with full tenant control (can manage billing, delete tenant)
 * - ADMIN: Tenant administrator with full tenant access
 * - USER: Standard tenant user with basic access
 * - VIEWER: Read-only access to tenant resources
 *
 * Multi-Role Semantics:
 * - Multiple roles allowed per membership
 * - Permissions resolved by UNION (additive)
 *
 * Token Boundary Note:
 * - Auth tokens store roles as `string[]` (runtime data)
 * - This enum provides compile-time type safety
 * - Use `toTenantRole()` to convert string to enum
 * - Use `toTenantRoleString()` to convert enum to string for token storage
 */
export enum TenantRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  USER = 'USER',
  VIEWER = 'VIEWER',
}

/**
 * Type alias for string role from token (matching AuthTokenPayload)
 * Use this when reading directly from token payload
 */
export type TenantRoleString = string;

/**
 * Convert runtime string to TenantRole enum
 * Throws if invalid role string
 */
export function toTenantRole(role: string): TenantRole {
  if (
    role === TenantRole.OWNER ||
    role === TenantRole.ADMIN ||
    role === TenantRole.USER ||
    role === TenantRole.VIEWER
  ) {
    return role as TenantRole;
  }
  throw new Error(`Invalid tenant role: ${role}`);
}

/**
 * Convert TenantRole enum to string for token storage
 */
export function toTenantRoleString(role: TenantRole): string {
  return role as string;
}

/**
 * Convert string array to TenantRole array
 * Filters out invalid roles
 */
export function toTenantRoles(roles: string[]): TenantRole[] {
  return roles
    .map(r => {
      try {
        return toTenantRole(r);
      } catch {
        return null;
      }
    })
    .filter((r): r is TenantRole => r !== null);
}

/**
 * Convert TenantRole array to string array for token storage
 */
export function toTenantRoleStrings(roles: TenantRole[]): string[] {
  return roles.map(r => toTenantRoleString(r));
}

/**
 * Helper functions for TenantRole
 */
export const TenantRoleHelpers = {
  /**
   * Check if roles array is empty
   */
  isEmpty(roles: TenantRole[]): boolean {
    return !roles || roles.length === 0;
  },

  /**
   * Check if membership has a specific role
   */
  hasRole(roles: TenantRole[], role: TenantRole): boolean {
    return roles.includes(role);
  },

  /**
   * Get default role for new memberships
   */
  getDefault(): TenantRole[] {
    return [TenantRole.USER];
  },

  /**
   * Convert token string array to TenantRole array
   */
  fromToken(roles: string[]): TenantRole[] {
    return toTenantRoles(roles);
  },

  /**
   * Convert TenantRole array to token string array
   */
  toToken(roles: TenantRole[]): string[] {
    return toTenantRoleStrings(roles);
  },
};