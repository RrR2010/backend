/**
 * AbilityFactory Tests
 *
 * Tests CASL ability creation for platform and tenant roles.
 * Implements TASK_005_014 unit tests for authorization system.
 */
import { AbilityFactory } from './ability.factory';
import { PlatformRole } from '@core/domain/platform-role.enum';
import { TenantRole } from '@core/domain/tenant-role.enum';
import { Action } from '@core/domain/casl/actions.enum';
import { Subject } from '@core/domain/casl/subjects.enum';

describe('AbilityFactory', () => {
  let factory: AbilityFactory;

  beforeEach(() => {
    factory = new AbilityFactory();
  });

  describe('createForUser (platform roles)', () => {
    it('should return no permissions for empty array (NONE)', () => {
      const ability = factory.createForUser({ platformRoles: [] });
      expect(ability.can(Action.Read, Subject.User)).toBe(false);
    });

    it('should grant READ permissions for USER role', () => {
      const ability = factory.createForUser({
        platformRoles: [PlatformRole.USER],
      });
      expect(ability.can(Action.Read, Subject.User)).toBe(true);
      expect(ability.can(Action.Read, Subject.Tenant)).toBe(true);
      expect(ability.can(Action.Manage, Subject.User)).toBe(false);
    });

    it('should grant MANAGE permissions for ADMIN role', () => {
      const ability = factory.createForUser({
        platformRoles: [PlatformRole.ADMIN],
      });
      expect(ability.can(Action.Manage, Subject.User)).toBe(true);
      expect(ability.can(Action.Manage, Subject.Tenant)).toBe(true);
      expect(ability.can(Action.Manage, Subject.Membership)).toBe(true);
    });

    it('should UNION permissions for ADMIN + USER', () => {
      const ability = factory.createForUser({
        platformRoles: [PlatformRole.ADMIN, PlatformRole.USER],
      });
      // Has all ADMIN permissions
      expect(ability.can(Action.Manage, Subject.User)).toBe(true);
      // AND all USER permissions
      expect(ability.can(Action.Read, Subject.User)).toBe(true);
    });
  });

  describe('createForMembership (tenant roles)', () => {
    it('should return no permissions for empty array', () => {
      const ability = factory.createForMembership({ tenantRoles: [] });
      expect(ability.can(Action.Read, Subject.Membership)).toBe(false);
    });

    it('should grant READ for USER role', () => {
      const ability = factory.createForMembership({
        tenantRoles: [TenantRole.USER],
      });
      expect(ability.can(Action.Read, Subject.Membership)).toBe(true);
      expect(ability.can(Action.Manage, Subject.Membership)).toBe(false);
    });

    it('should grant MANAGE for ADMIN role', () => {
      const ability = factory.createForMembership({
        tenantRoles: [TenantRole.ADMIN],
      });
      expect(ability.can(Action.Manage, Subject.Membership)).toBe(true);
    });

    it('should UNION permissions for ADMIN + USER', () => {
      const ability = factory.createForMembership({
        tenantRoles: [TenantRole.ADMIN, TenantRole.USER],
      });
      expect(ability.can(Action.Manage, Subject.Membership)).toBe(true);
      expect(ability.can(Action.Read, Subject.Membership)).toBe(true);
    });
  });
});
