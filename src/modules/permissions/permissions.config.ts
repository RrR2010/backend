/**
 * Permissions Configuration
 *
 * CASL permissions configuration following nest-casl pattern.
 * Defines actions, subjects, and permission mappings for each module.
 *
 * Used with: forFeature() in nest-casl module registration.
 *
 * TASK_005_022: Create permissions module configuration
 */
import { Actions, Permissions } from 'nest-casl';
import { PlatformRole } from '@core/domain/platform-role.enum';
import { TenantRole } from '@core/domain/tenant-role.enum';

/**
 * Define permissions for platform-level roles (User, Tenant, Membership)
 * Maps platform roles to their CASL permissions.
 */
export const platformPermissions: Permissions<
  PlatformRole,
  'User' | 'Tenant' | 'Membership'
> = {
  [PlatformRole.ADMIN]: (builder) => {
    builder.can(Actions.manage, 'User');
    builder.can(Actions.manage, 'Tenant');
    builder.can(Actions.manage, 'Membership');
  },
  [PlatformRole.USER]: (builder) => {
    builder.can(Actions.read, 'User');
    builder.can(Actions.read, 'Tenant');
  },
};

/**
 * Define permissions for tenant-level roles (User, Tenant, Membership)
 * Maps tenant roles to their CASL permissions.
 */
export const tenantPermissions: Permissions<
  TenantRole,
  'User' | 'Tenant' | 'Membership'
> = {
  [TenantRole.ADMIN]: (builder) => {
    builder.can(Actions.manage, 'Membership');
  },
  [TenantRole.USER]: (builder) => {
    builder.can(Actions.read, 'Membership');
  },
};

/**
 * Combined permissions configuration for nest-casl forFeature()
 *
 * Export this as the permissions option in forFeature() call.
 *
 * @example
 * ```typescript
 * import { CaslModule } from 'nest-casl';
 * import { platformPermissions } from './permissions.config';
 *
 * @Module({
 *   imports: [CaslModule.forFeature({ permissions: platformPermissions })],
 * })
 * export class UsersModule {}
 * ```
 */
export const permissions = platformPermissions;

/**
 * Re-export actions from nest-casl for use in other modules
 *
 * Standard CASL actions:
 * - create: Permission to create new entities
 * - read: Permission to view entities
 * - update: Permission to modify entities
 * - delete: Permission to remove entities
 * - manage: Full access (create, read, update, delete)
 * - aggregate: Permission to aggregate data
 */
export { Actions };
