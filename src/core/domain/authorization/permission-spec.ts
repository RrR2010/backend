/**
 * PermissionSpec Types
 *
 * Canonical permission representation for decorators and guards.
 * Combines action and subject for type-safe permission definitions.
 *
 * Used by:
 * - @RequiresPermission decorator
 * - CASL AbilityBuilder
 * - Authorization guards
 */
import { PermissionAction } from './action.enum';
import { PermissionSubject } from './subject.enum';

/**
 * Base permission specification shape
 * Defines the minimum required properties for a permission check
 *
 * @example Read users:
 *   { action: PermissionAction.Read, subject: PermissionSubject.User }
 *
 * @example Create tenants:
 *   { action: PermissionAction.Create, subject: PermissionSubject.Tenant }
 *
 * @example Delete memberships:
 *   { action: PermissionAction.Delete, subject: PermissionSubject.Membership }
 */
export type PermissionSpec = {
  /** The action to perform */
  action: PermissionAction;

  /** The subject (entity) to act upon */
  subject: PermissionSubject;
};

/**
 * Permission with conditions (for ABAC)
 * Used for attribute-based access control with additional conditions
 *
 * @example Own record only:
 *   { action: PermissionAction.Read, subject: PermissionSubject.User, conditions: { owner: 'ownerId' } }
 */
export type ConditionalPermissionSpec = PermissionSpec & {
  /** ABAC conditions */
  conditions?: Record<string, unknown>;
};

/**
 * Helper functions for PermissionSpec
 */
export const PermissionSpecHelpers = {
  /**
   * Create a permission spec
   */
  create(
    action: PermissionAction,
    subject: PermissionSubject,
  ): PermissionSpec {
    return { action, subject };
  },

  /**
   * Create a conditional permission spec
   */
  createConditional(
    action: PermissionAction,
    subject: PermissionSubject,
    conditions: Record<string, unknown>,
  ): ConditionalPermissionSpec {
    return { action, subject, conditions };
  },

  /**
   * Check if permission implies another (Manage implies all)
   */
  implies(spec: PermissionSpec, target: PermissionSpec): boolean {
    if (spec.action === PermissionAction.Manage) {
      return spec.subject === target.subject || spec.subject === PermissionSubject.All;
    }
    return spec.action === target.action && spec.subject === target.subject;
  },
};

/**
 * Type alias for string representation (for legacy compatibility)
 * Can be generated from PermissionSpec using transforms
 */
export type PermissionString = `${PermissionSubject}.${PermissionAction}`;