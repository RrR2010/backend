/**
 * Check Permissions Decorator
 *
 * Decorator to define permission requirements for route handlers.
 * Used with PermissionsGuard for CASL-based authorization.
 */
import { SetMetadata } from '@nestjs/common';
import { PermissionSpec } from '@core/domain/permission-spec';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Check Permissions Decorator
 *
 * Sets permission metadata on route handlers for PermissionsGuard validation.
 *
 * @example
 * @CheckPermissions({ action: Action.Read, subject: Subject.User })
 * @CheckPermissions({ action: Action.Create, subject: Subject.Tenant })
 */
export const CheckPermissions = (
  ...rules: PermissionSpec[]
) => SetMetadata(PERMISSIONS_KEY, rules);
