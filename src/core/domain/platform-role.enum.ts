/**
 * PlatformRole Enum
 *
 * Represents global/system-wide roles at the platform level.
 * These roles apply to user accounts regardless of tenant context.
 *
 * Canonical Definition:
 * - ADMIN: Platform administrator with full system access
 * - MEMBER: Standard platform user with basic access
 *
 * Multi-Role Semantics:
 * - Multiple roles allowed per user
 * - NONE is a DERIVED state (empty array), not a stored value
 * - Permissions resolved by UNION (additive)
 */
export enum PlatformRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

/**
 * Helper functions for PlatformRole
 */
export const PlatformRoleHelpers = {
  /**
   * Check if roles array is empty (derived NONE state)
   */
  isNone(roles: PlatformRole[]): boolean {
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
    return [PlatformRole.MEMBER];
  },
};
