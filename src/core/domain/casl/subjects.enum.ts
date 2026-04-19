/**
 * CASL Subjects Enum
 *
 * Defines the available subjects (entities) that can be protected
 * by the CASL authorization system.
 *
 * Canonical Definitions:
 * - User: User entity representing platform users
 * - Tenant: Tenant entity representing organizations
 * - Membership: Membership entity linking users to tenants
 * - All: Wildcard subject for default permissions
 */
export enum Subject {
  User = 'User',
  Tenant = 'Tenant',
  Membership = 'Membership',
  All = 'all',
}
