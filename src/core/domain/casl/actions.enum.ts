/**
 * CASL Actions Enum
 *
 * Defines the available actions that can be performed on subjects
 * in the CASL authorization system.
 *
 * Canonical Definitions:
 * - Manage: Full access (create, read, update, delete)
 * - Create: Permission to create new entities
 * - Read: Permission to view entities
 * - Update: Permission to modify entities
 * - Delete: Permission to remove entities
 */
export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}
