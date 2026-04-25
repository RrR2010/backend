/**
 * Authorization Domain Model
 *
 * Canonical vocabulary for roles, scopes, actions, subjects, and permission specs.
 * This is the single source of truth for all authorization-related types.
 *
 * ============================================================================
 * KEY CONCEPTS
 * ============================================================================
 *
 * - PermissionAction: What action can be performed (create, read, update, delete, manage)
 * - PermissionSubject: What entity is being acted upon (User, Tenant, Membership)
 * - AuthorizationScope: Where the authorization applies (platform or tenant)
 * - PlatformRole/TenantRole: What role the user has in their scope
 * - RoleAssignment: Discriminated union tying scope to role (enforces mutual exclusivity)
 * - AuthorizationContext: Separates request context from resource attributes
 * - PermissionSpec: Canonical permission representation
 *
 * ============================================================================
 * TOKEN BOUNDARY
 * ============================================================================
 *
 * Auth tokens store roles as `string[]` (runtime strings).
 * This module provides compile-time type safety.
 *
 * Converting from token:
 *   import { PlatformRoleHelpers } from '@core/domain/authorization';
 *   const typedRoles = PlatformRoleHelpers.fromToken(payload.platformRoles || []);
 *
 * Converting to token:
 *   import { PlatformRoleHelpers } from '@core/domain/authorization';
 *   const stringRoles = PlatformRoleHelpers.toToken(roles);
 *
 * ============================================================================
 * USAGE EXAMPLES
 * ============================================================================
 *
 *   import { PermissionAction, PermissionSubject, AuthorizationScope } from '@core/domain/authorization';
 *
 *   // Example: Check if user can read users
 *   const permission: PermissionSpec = {
 *     action: PermissionAction.Read,
 *     subject: PermissionSubject.User,
 *   };
 *
 *   // Example: Platform role (discriminated union)
 *   const platformRole: RoleAssignment = {
 *     scope: AuthorizationScope.Platform,
 *     role: PlatformRole.ADMIN,
 *   };
 *
 *   // Example: Tenant role (discriminated union)
 *   const tenantRole: RoleAssignment = {
 *     scope: AuthorizationScope.Tenant,
 *     role: TenantRole.ADMIN,
 *     tenantId: 'tenant-123',
 *   };
 *
 *   // Example: From token payload (multi-role support)
 *   import { AuthorizationContextHelpers } from '@core/domain/authorization';
 *   const ctx = AuthorizationContextHelpers.fromTokenPayload(tokenPayload);
 *   const hasAdmin = ctx.request.allRoles?.some(r => r.role === PlatformRole.ADMIN);
 */

// ============================================================================
// Actions
// ============================================================================

export { PermissionAction, PermissionActionHelpers } from './action.enum';

// ============================================================================
// Subjects
// ============================================================================

export { PermissionSubject, PermissionSubjectHelpers } from './subject.enum';

// ============================================================================
// Scope
// ============================================================================

export { AuthorizationScope, AuthorizationScopeHelpers } from './scope.enum';

// Re-export AuthScope alias for token payload compatibility
export type { AuthScope } from './scope.enum';
export {
  AuthorizationScopeToAuthScope,
  AuthScopeToAuthorizationScope,
} from './scope.enum';

// ============================================================================
// Roles
// ============================================================================

export { PlatformRole, PlatformRoleHelpers } from './platform-role.enum';
export type { PlatformRoleString } from './platform-role.enum';
export {
  toPlatformRole,
  toPlatformRoles,
  toPlatformRoleString,
  toPlatformRoleStrings,
} from './platform-role.enum';

export { TenantRole, TenantRoleHelpers } from './tenant-role.enum';
export type { TenantRoleString } from './tenant-role.enum';
export {
  toTenantRole,
  toTenantRoles,
  toTenantRoleString,
  toTenantRoleStrings,
} from './tenant-role.enum';

export type {
  PlatformRoleAssignment,
  TenantRoleAssignment,
  RoleAssignment,
  PlatformRoleAssignments,
  TenantRoleAssignments,
  Role,
} from './role.types';
export { RoleAssignment, RoleHelpers } from './role.types';

// ============================================================================
// Context
// ============================================================================

export type {
  RequestContext,
  ResourceAttributes,
  AuthorizationContext,
} from './context.interface';
export { AuthorizationContextHelpers } from './context.interface';

// ============================================================================
// Permission Spec
// ============================================================================

export type {
  PermissionSpec,
  ConditionalPermissionSpec,
  PermissionString,
} from './permission-spec';
export { PermissionSpecHelpers } from './permission-spec';