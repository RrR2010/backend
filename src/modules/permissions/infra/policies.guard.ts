/**
 * Permissions Guard
 *
 * CASL-based guard for permission enforcement.
 * Implements TASK_005_009 for permission checking using AbilityFactory.
 */
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AbilityFactory } from '@modules/permissions/application/ability.factory';
import { Action } from '@core/domain/casl/actions.enum';
import { Subject } from '@core/domain/casl/subjects.enum';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Permissions Guard
 *
 * Validates user permissions based on CASL ability rules.
 * Extracts action/subject requirements from decorator metadata
 * and validates against user's ability (platform or tenant).
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private abilityFactory: AbilityFactory,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Extract action and subject from metadata
    const permissions = this.reflector.get<{ action: Action; subject: Subject }[]>(
      PERMISSIONS_KEY,
      context.getHandler(),
    );

    if (!permissions || permissions.length === 0) {
      // No explicit permissions - reject (fail-safe default)
      throw new ForbiddenException('No explicit permissions defined - use @CheckPermissions');
    }

    // Resolve scope: platform (tenantId missing) or tenant
    const ability = user.tenantId
      ? this.abilityFactory.createForMembership({
          tenantRoles: user.tenantRoles || [],
        })
      : this.abilityFactory.createForUser({
          platformRoles: user.platformRoles || [],
        });

    // Check all permission rules - reject by default
    const hasPermission = permissions.every(({ action, subject }) =>
      ability.can(action, subject),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
