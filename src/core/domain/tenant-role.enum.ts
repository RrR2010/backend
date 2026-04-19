/**
 * TenantRole Enum
 * 
 * Represents roles within a specific tenant context.
 * These roles are assigned to users via Membership entities.
 * 
 * Canonical Definition:
 * - ADMIN: Tenant administrator with full tenant access
 * - USER: Standard tenant user with basic access
 */
export enum TenantRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}