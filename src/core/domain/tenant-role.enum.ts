/**
 * TenantRole Enum
 *
 * Represents roles within a specific tenant context.
 * These roles are assigned to users via Membership entities.
 *
 * Canonical Definition:
 * - ADMIN: Tenant administrator with full tenant access
 * - USER: Standard tenant user with basic access
 *
 * Multi-Role Semantics:
 * - Multiple roles allowed per membership
 * - Permissions resolved by UNION (additive)
 */
export enum TenantRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
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
};