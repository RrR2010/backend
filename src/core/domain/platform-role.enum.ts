/**
 * PlatformRole Enum
 *
 * Represents global/system-wide roles at the platform level.
 * These roles apply to user accounts regardless of tenant context.
 *
 * Canonical Definition:
 * - ADMIN: Platform administrator with full system access
 * - MEMBER: Standard platform user with basic access
 */
export enum PlatformRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}
