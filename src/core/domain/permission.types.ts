/**
 * Permission Types
 *
 * Defines atomic operation capabilities for authorization.
 *
 * Canonical Definitions:
 * - PlatformPermission: Operations scoped to platform (global) level
 * - TenantPermission: Operations scoped to specific tenant context
 *
 * Permission Naming Convention: {resource}.{action}
 * Example: 'user.read', 'tenant.create', 'membership.delete'
 */

/**
 * Platform-level permissions
 * These permissions apply globally across the entire platform
 */
export enum PlatformPermission {
  // User management
  USER_READ = 'user.read',
  USER_CREATE = 'user.create',
  USER_UPDATE = 'user.update',
  USER_DELETE = 'user.delete',

  // Tenant management
  TENANT_READ = 'tenant.read',
  TENANT_CREATE = 'tenant.create',
  TENANT_UPDATE = 'tenant.update',
  TENANT_DELETE = 'tenant.delete',

  // Platform administration
  PLATFORM_ADMIN = 'platform.admin',
}

/**
 * Tenant-level permissions
 * These permissions apply within a specific tenant context
 */
export enum TenantPermission {
  // Membership management
  MEMBERSHIP_READ = 'membership.read',
  MEMBERSHIP_CREATE = 'membership.create',
  MEMBERSHIP_UPDATE = 'membership.update',
  MEMBERSHIP_DELETE = 'membership.delete',

  // Tenant user permissions
  TENANT_USER_READ = 'tenant.user.read',
  TENANT_USER_INVITE = 'tenant.user.invite',
  TENANT_USER_REMOVE = 'tenant.user.remove',
}

/**
 * Permission scope types for type-safe checking
 */
export type PermissionScope = 'platform' | 'tenant';

/**
 * Union type for any permission
 */
export type Permission = PlatformPermission | TenantPermission;
