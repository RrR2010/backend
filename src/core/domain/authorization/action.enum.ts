/**
 * PermissionAction Enum
 *
 * Defines the available actions that can be performed on subjects
 * in the authorization system (CASL-style).
 *
 * Canonical Definitions:
 * - Manage: Full access (create, read, update, delete)
 * - Create: Permission to create new entities
 * - Read: Permission to view entities
 * - Update: Permission to modify entities
 * - Delete: Permission to remove entities
 *
 * Used by:
 * - Decorators (@RequiresPermission)
 * - Guards (CASL AbilityBuilder)
 * - Permission checks in services
 */
export enum PermissionAction {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

/**
 * Helper functions for PermissionAction
 */
export const PermissionActionHelpers = {
  /**
   * Get all available actions as an array
   */
  getAll(): PermissionAction[] {
    return [
      PermissionAction.Manage,
      PermissionAction.Create,
      PermissionAction.Read,
      PermissionAction.Update,
      PermissionAction.Delete,
    ];
  },

  /**
   * Check if action implies another (Manage implies all others)
   */
  implies(action: PermissionAction, target: PermissionAction): boolean {
    if (action === PermissionAction.Manage) {
      return true;
    }
    return action === target;
  },
};