/**
 * Ability Factory
 *
 * Creates CASL abilities based on user roles (platform and tenant).
 * Implements TASK_005_008 for CASL-based authorization system.
 */
import { Injectable } from '@nestjs/common';
import {
  AbilityBuilder,
  createMongoAbility,
  MongoAbility,
} from '@casl/ability';
import { PlatformRole } from '@core/domain/platform-role.enum';
import { TenantRole } from '@core/domain/tenant-role.enum';
import { Action } from '@core/domain/casl/actions.enum';
import { Subject } from '@core/domain/casl/subjects.enum';

export type AppAbility = MongoAbility;

/**
 * Ability Factory Service
 *
 * Creates CASL abilities for authorization based on:
 * - Platform roles (system-wide permissions)
 * - Tenant roles (tenant-specific permissions)
 */
@Injectable()
export class AbilityFactory {
  /**
   * Create ability for platform-level user
   * @param user - User object with platformRoles
   */
  createForUser(user: { platformRoles: PlatformRole[] }): AppAbility {
    const { can, build } = new AbilityBuilder(createMongoAbility);

    for (const role of user.platformRoles || []) {
      this.addPlatformPermissions(can, role);
    }

    // Deny-by-default: no default permissions - roles must explicitly grant access

    return build();
  }

  /**
   * Create ability for tenant-level membership
   * @param membership - Membership object with tenantRoles
   */
  createForMembership(membership: { tenantRoles: TenantRole[] }): AppAbility {
    const { can, build } = new AbilityBuilder(createMongoAbility);

    for (const role of membership.tenantRoles || []) {
      this.addTenantPermissions(can, role);
    }

    // Deny-by-default: no default permissions - roles must explicitly grant access

    return build();
  }

  /**
   * Add platform-level permissions based on role
   */
  private addPlatformPermissions(
    can: typeof AbilityBuilder.prototype.can,
    role: PlatformRole,
  ) {
    switch (role) {
      case PlatformRole.ADMIN:
        can(Action.Manage, Subject.User);
        can(Action.Manage, Subject.Tenant);
        can(Action.Manage, Subject.Membership);
        break;
      case PlatformRole.USER:
        can(Action.Read, Subject.User);
        can(Action.Read, Subject.Tenant);
        break;
    }
  }

  /**
   * Add tenant-level permissions based on role
   */
  private addTenantPermissions(
    can: typeof AbilityBuilder.prototype.can,
    role: TenantRole,
  ) {
    switch (role) {
      case TenantRole.ADMIN:
        can(Action.Manage, Subject.Membership);
        break;
      case TenantRole.USER:
        can(Action.Read, Subject.Membership);
        break;
    }
  }
}
