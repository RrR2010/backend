/**
 * PlatformRole Enum
 *
 * Represents global/system-wide roles at the platform level.
 * These roles apply to user accounts regardless of tenant context.
 *
 * Canonical Definitions:
 * - ADMIN: Platform administrator with full system access
 * - USER: Standard platform user with basic access
 *
 * Multi-Role Semantics:
 * - Multiple roles allowed per user
 * - NONE is a DERIVED state (empty array), not a stored value
 * - Permissions resolved by UNION (additive)
 *
 * Token Boundary Note:
 * - Auth tokens store roles as `string[]` (runtime data)
 * - This enum provides compile-time type safety
 * - Use `toPlatformRole()` to convert string to enum
 * - Use `toPlatformRoleString()` to convert enum to string for token storage
 */
export enum PlatformRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

/**
 * Type alias for string role from token (matching AuthTokenPayload)
 * Use this when reading directly from token payload
 */
export type PlatformRoleString = string;

/**
 * Convert runtime string to PlatformRole enum
 * Throws if invalid role string
 */
export function toPlatformRole(role: string): PlatformRole {
  if (role === PlatformRole.ADMIN || role === PlatformRole.USER) {
    return role as PlatformRole;
  }
  throw new Error(`Invalid platform role: ${role}`);
}

/**
 * Convert PlatformRole enum to string for token storage
 */
export function toPlatformRoleString(role: PlatformRole): string {
  return role as string;
}

/**
 * Convert string array to PlatformRole array
 * Filters out invalid roles
 */
export function toPlatformRoles(roles: string[]): PlatformRole[] {
  return roles
    .map(r => {
      try {
        return toPlatformRole(r);
      } catch {
        return null;
      }
    })
    .filter((r): r is PlatformRole => r !== null);
}

/**
 * Convert PlatformRole array to string array for token storage
 */
export function toPlatformRoleStrings(roles: PlatformRole[]): string[] {
  return roles.map(r => toPlatformRoleString(r));
}

/**
 * Helper functions for PlatformRole
 */
export const PlatformRoleHelpers = {
  /**
   * Check if roles array is empty (derived NONE state)
   * @deprecated Use `isEmpty()` for consistency with TenantRoleHelpers
   */
  isNone(roles: PlatformRole[]): boolean {
    return PlatformRoleHelpers.isEmpty(roles);
  },

  /**
   * Check if roles array is empty
   */
  isEmpty(roles: PlatformRole[]): boolean {
    return !roles || roles.length === 0;
  },

  /**
   * Check if user has a specific role
   */
  hasRole(roles: PlatformRole[], role: PlatformRole): boolean {
    return roles.includes(role);
  },

  /**
   * Get default role for new users
   */
  getDefault(): PlatformRole[] {
    return [PlatformRole.USER];
  },

  /**
   * Convert token string array to PlatformRole array
   */
  fromToken(roles: string[]): PlatformRole[] {
    return toPlatformRoles(roles);
  },

  /**
   * Convert PlatformRole array to token string array
   */
  toToken(roles: PlatformRole[]): string[] {
    return toPlatformRoleStrings(roles);
  },
};