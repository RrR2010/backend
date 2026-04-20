/**
 * Permission Specifications
 *
 * Shared type definitions for CASL permission specifications.
 * Provides type-safe permission definitions for decorators and guards.
 */
import { Action } from './casl/actions.enum';
import { Subject } from './casl/subjects.enum';

/**
 * Base permission specification shape
 * Defines the minimum required properties for a permission check
 */
export type PermissionSpec = {
  action: Action;
  subject: Subject;
};

/**
 * Permission with explicit scope (optional disambiguation)
 * Used when scope needs to be explicitly defined for multi-tenant scenarios
 */
export type ScopedPermissionSpec = PermissionSpec & {
  scope?: 'platform' | 'tenant';
};

/**
 * Permission with conditions (for ABAC)
 * Used for attribute-based access control with additional conditions
 */
export type ConditionalPermissionSpec = PermissionSpec & {
  conditions?: Record<string, unknown>;
};

/**
 * Full permission spec with all options
 * Complete specification combining scope and conditions
 */
export type FullPermissionSpec = {
  action: Action;
  subject: Subject;
  scope?: 'platform' | 'tenant';
  conditions?: Record<string, unknown>;
};