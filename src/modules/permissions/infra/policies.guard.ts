/**
 * Permissions Guard
 *
 * CASL-based guard for permission enforcement.
 * Implements TASK_005_009 for permission checking using AbilityFactory.
 * Roles are resolved from database for security (not embedded in token).
 */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AbilityFactory } from '@modules/permissions/application/ability.factory';
import { Action } from '@core/domain/casl/actions.enum';
import { Subject } from '@core/domain/casl/subjects.enum';
import { PermissionSpec } from '@core/domain/permission-spec';
import { AuthTokenPayload } from '@modules/authentication/domain/token.service';
import { MembershipRepository } from '@modules/memberships/domain/membership.repository';
import { UserRepository } from '@modules/users/domain/user.repository';
import { PlatformRole } from '@core/domain/platform-role.enum';
import { TenantRole } from '@core/domain/tenant-role.enum';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Permissions Guard
 *
 * Validates user permissions based on CASL ability rules.
 * Extracts action/subject requirements from decorator metadata
 * and validates against user's roles resolved from database.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private abilityFactory: AbilityFactory,
    @Inject(MembershipRepository)
    private readonly membershipRepository: MembershipRepository,
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as Request;
    const user = request.user as AuthTokenPayload;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Extract action and subject from metadata
    const permissions = this.reflector.get<PermissionSpec[]>(
      PERMISSIONS_KEY,
      context.getHandler(),
    );

    if (!permissions || permissions.length === 0) {
      // No explicit permissions - reject (fail-safe default)
      throw new ForbiddenException(
        'No explicit permissions defined - use @CheckPermissions',
      );
    }

    // Resolve roles from database based on scope
    let platformRoles: PlatformRole[] = [];
    let tenantRoles: TenantRole[] = [];

    if (user.tenantId) {
      // Tenant scope: get roles from membership
      const memberships = await this.membershipRepository.findByUserId(
        user.sub,
      );
      const membership = memberships?.find((m) => m.tenantId === user.tenantId);
      if (membership) {
        tenantRoles = membership.tenantRoles;
      }
    } else {
      // Platform scope: get roles from user
      const User = await this.userRepository.findById(user.sub);
      if (User) {
        platformRoles = User.platformRoles;
      }
    }

    // Create ability with resolved roles
    const ability = user.tenantId
      ? this.abilityFactory.createForMembership({
          tenantRoles: tenantRoles,
        })
      : this.abilityFactory.createForUser({
          platformRoles: platformRoles,
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
