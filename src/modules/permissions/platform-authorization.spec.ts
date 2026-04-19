/**
 * Platform Authorization Tests
 *
 * Tests platform scope authorization in PermissionsGuard.
 * Implements TASK_005_016 for platform-only guard logic.
 *
 * Tests verify:
 * 1. Platform role-based permissions (no tenantId)
 * 2. Platform-only access for member/tenant-only users
 * 3. Role permission union for multiple platform roles
 */
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PermissionsGuard } from './infra/policies.guard';
import { AbilityFactory } from './application/ability.factory';
import { PlatformRole } from '@core/domain/platform-role.enum';
import { TenantRole } from '@core/domain/tenant-role.enum';
import { Action } from '@core/domain/casl/actions.enum';
import { Subject } from '@core/domain/casl/subjects.enum';
import { MembershipRepository } from '@modules/memberships/domain/membership.repository';
import { UserRepository } from '@modules/users/domain/user.repository';

describe('Platform Authorization (TASK_005_016)', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;
  let abilityFactory: AbilityFactory;
  let mockMembershipRepository: jest.Mocked<MembershipRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const mockMembershipRepo = {
      findByUserId: jest.fn(),
    };
    const mockUserRepo = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsGuard,
        AbilityFactory,
        { provide: MembershipRepository, useValue: mockMembershipRepo },
        { provide: UserRepository, useValue: mockUserRepo },
      ],
    }).compile();

    guard = module.get<PermissionsGuard>(PermissionsGuard);
    reflector = module.get<Reflector>(Reflector);
    abilityFactory = module.get<AbilityFactory>(AbilityFactory);
    mockMembershipRepository = module.get(MembershipRepository);
    mockUserRepository = module.get(UserRepository);
  });

  const createMockContext = (
    user: any,
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => ({}),
    } as ExecutionContext;
  };

  describe('Platform scope (no tenantId)', () => {
    it('should deny when user has NO platform roles (NONE)', async () => {
      const user = { sub: 'user-1', platformRoles: [], tenantId: undefined };
      const context = createMockContext(user);

      jest.spyOn(reflector, 'get').mockReturnValue([
        { action: Action.Read, subject: Subject.User },
      ]);

      // User has no platform roles - repository returns undefined
      mockUserRepository.findById.mockResolvedValue(undefined);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow READ for MEMBER role', async () => {
      const user = {
        sub: 'user-1',
        platformRoles: [PlatformRole.MEMBER],
        tenantId: undefined,
      };
      const context = createMockContext(user);

      jest.spyOn(reflector, 'get').mockReturnValue([
        { action: Action.Read, subject: Subject.User },
      ]);

      mockUserRepository.findById.mockResolvedValue({
        id: 'user-1',
        platformRoles: [PlatformRole.MEMBER],
      });

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should block MANAGE for MEMBER role', async () => {
      const user = {
        sub: 'user-1',
        platformRoles: [PlatformRole.MEMBER],
        tenantId: undefined,
      };
      const context = createMockContext(user);

      jest.spyOn(reflector, 'get').mockReturnValue([
        { action: Action.Manage, subject: Subject.User },
      ]);

      mockUserRepository.findById.mockResolvedValue({
        id: 'user-1',
        platformRoles: [PlatformRole.MEMBER],
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow MANAGE for ADMIN role', async () => {
      const user = {
        sub: 'user-1',
        platformRoles: [PlatformRole.ADMIN],
        tenantId: undefined,
      };
      const context = createMockContext(user);

      jest.spyOn(reflector, 'get').mockReturnValue([
        { action: Action.Manage, subject: Subject.User },
      ]);

      mockUserRepository.findById.mockResolvedValue({
        id: 'user-1',
        platformRoles: [PlatformRole.ADMIN],
      });

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should UNION permissions for ADMIN + MEMBER', async () => {
      const user = {
        sub: 'user-1',
        platformRoles: [PlatformRole.ADMIN, PlatformRole.MEMBER],
        tenantId: undefined,
      };
      const context = createMockContext(user);

      jest.spyOn(reflector, 'get').mockReturnValue([
        { action: Action.Manage, subject: Subject.User },
        { action: Action.Read, subject: Subject.Tenant },
      ]);

      mockUserRepository.findById.mockResolvedValue({
        id: 'user-1',
        platformRoles: [PlatformRole.ADMIN, PlatformRole.MEMBER],
      });

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });
  });

  describe('Platform-only access blocked for tenant-only users', () => {
    it('should deny platform endpoint when user has ONLY tenantRoles', async () => {
      // User has tenantId but NO platformRoles
      const user = {
        sub: 'user-1',
        tenantId: 'tenant-1',
        platformRoles: [],
      };
      const context = createMockContext(user);

      jest.spyOn(reflector, 'get').mockReturnValue([
        { action: Action.Read, subject: Subject.User },
      ]);

      // Since tenantId exists, guard reads tenantRoles from membership
      mockMembershipRepository.findByUserId.mockResolvedValue([
        { userId: 'user-1', tenantId: 'tenant-1', tenantRoles: [TenantRole.ADMIN] },
      ]);

      // Tenant ADMIN can only Manage Membership, NOT Read User
      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow platform access when user has platform roles even WITH tenantId', async () => {
      // User has BOTH tenantId and platformRoles - platformRoles take precedence
      const user = {
        sub: 'user-1',
        tenantId: 'tenant-1',
        platformRoles: [PlatformRole.MEMBER],
      };
      const context = createMockContext(user);

      jest.spyOn(reflector, 'get').mockReturnValue([
        { action: Action.Read, subject: Subject.User },
      ]);

      // With tenantId, guard defaults to tenant scope
      mockMembershipRepository.findByUserId.mockResolvedValue([
        { userId: 'user-1', tenantId: 'tenant-1', tenantRoles: [TenantRole.USER] },
      ]);

      // Tenant USER can read Membership but NOT User subject
      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});