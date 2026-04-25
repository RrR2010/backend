/**
 * PermissionSubject Enum
 *
 * Defines the available subjects (entities) that can be protected
 * by the authorization system.
 *
 * Canonical Definitions:
 * - User: User entity representing platform users
 * - Tenant: Tenant entity representing organizations
 * - Membership: Membership entity linking users to tenants
 * - All: Wildcard subject for default permissions
 *
 * Used by:
 * - Decorators (@RequiresPermission)
 * - CASL Subject types
 * - Permission checks in services
 */
export enum PermissionSubject {
  User = 'User',
  Tenant = 'Tenant',
  Membership = 'Membership',
  All = 'all',
}

/**
 * Helper functions for PermissionSubject
 */
export const PermissionSubjectHelpers = {
  /**
   * Get all available subjects as an array
   */
  getAll(): PermissionSubject[] {
    return [
      PermissionSubject.User,
      PermissionSubject.Tenant,
      PermissionSubject.Membership,
      PermissionSubject.All,
    ];
  },

  /**
   * Check if subject is valid
   */
  isValid(subject: string): boolean {
    return Object.values(PermissionSubject).includes(subject as PermissionSubject);
  },
};