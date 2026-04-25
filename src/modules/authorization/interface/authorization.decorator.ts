/**
 * Authorization Decorator
 *
 * Provides decorators for authorization metadata.
 *
 * Used to annotate controllers/actions with required permissions.
 */
import { SetMetadata } from '@nestjs/common';
import { PermissionSpec, PermissionAction, PermissionSubject } from '@core/domain/authorization';

/**
 * Metadata key for authorization
 */
export const AUTHORIZATION_KEY = 'authorization';

/**
 * Authorize decorator options
 */
export interface AuthorizeOptions {
  /** Required permission */
  permission: PermissionSpec;

  /** Require all permissions instead of any */
  requireAll?: boolean;

  /** Allow only resource owner */
  ownerOnly?: boolean;

  /** Custom policy ID */
  policyId?: string;

  /** Required scope: platform or tenant level */
  scope?: 'platform' | 'tenant';
}

/**
 * Authorize decorator
 *
 * Marks a controller action as requiring authorization.
 *
 * @example Simple permission
 *   @Authorize({ permission: { action: PermissionAction.Read, subject: PermissionSubject.User } })
 *   @Get()
 *   findAll() {}
 *
 * @example Multiple permissions (any)
 *   @Authorize({ permission: [{ action: PermissionAction.Read, subject: PermissionSubject.User }, { action: PermissionAction.Read, subject: PermissionSubject.Tenant }] })
 *   @Get()
 *   findAll() {}
 *
 * @example All permissions required
 *   @Authorize({ permission: [...], requireAll: true })
 *   @Get()
 *   findAll() {}
 *
 * @example Owner-only access
 *   @Authorize({ permission: { action: PermissionAction.Update, subject: PermissionSubject.User }, ownerOnly: true })
 *   @Patch(':id')
 *   update(@Param('id') id: string, @Body() dto: UpdateUserDto) {}
 */
export function Authorize(options: AuthorizeOptions): MethodDecorator {
  return SetMetadata(AUTHORIZATION_KEY, options);
}

/**
 * Check decorator - alias for Authorize with requireAll = true
 *
 * @example
 *   @Check({ permission: [{ action: PermissionAction.Read, subject: PermissionSubject.User }, { action: PermissionAction.Read, subject: PermissionSubject.Tenant }] })
 *   @Get()
 *   findAll() {}
 */
export function Check(options: AuthorizeOptions): MethodDecorator {
  return SetMetadata(AUTHORIZATION_KEY, {
    ...options,
    requireAll: true,
  });
}

/**
 * Public decorator - marks a route as public (no auth required)
 */
export function Public(): MethodDecorator {
  return SetMetadata('isPublic', true);
}

/**
 * Guest decorator - alias for Public
 */
export const Guest = Public;