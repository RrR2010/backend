import { Test, TestingModule } from '@nestjs/testing';
import { LoginUseCase } from './login.usecase';
import { UserRepository } from '@modules/users/domain/user.repository';
import { PasswordHasher } from '@modules/authentication/domain/password-hasher';
import { MembershipRepository } from '@modules/memberships/domain/membership.repository';
import { TenantRepository } from '@modules/tenants/domain/tenant.repository';
import { InvalidCredentialsError } from '@modules/authentication/domain/auth.errors';
import { User } from '@modules/users/domain/user.entity';
import { Email } from '@core/domain/email.vo';
import { Membership } from '@modules/memberships/domain/membership.entity';
import { Tenant } from '@modules/tenants/domain/tenant.entity';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let passwordHasher: jest.Mocked<PasswordHasher>;
  let membershipRepository: jest.Mocked<MembershipRepository>;
  let tenantRepository: jest.Mocked<TenantRepository>;

  const createMockUser = (overrides: Partial<{ id: string; email: Email; passwordHash: string; platformRoles: string[] }> = {}) => {
    const mockUser = {
      id: { value: overrides.id || 'user-123' },
      email: overrides.email || Email.from('test@example.com'),
      passwordHash: overrides.passwordHash || 'hashed-password',
      platformRoles: overrides.platformRoles || [],
    } as User;
    return mockUser;
  };

  const createMockTenant = (id: string, name: string) => {
    return {
      id: { value: id },
      name,
    } as unknown as Tenant;
  };

  beforeEach(async () => {
    const mockUserRepository = {
      findByEmail: jest.fn(),
    };

    const mockPasswordHasher = {
      compare: jest.fn(),
    };

    const mockMembershipRepository = {
      findByUserId: jest.fn(),
    };

    const mockTenantRepository = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: PasswordHasher, useValue: mockPasswordHasher },
        { provide: MembershipRepository, useValue: mockMembershipRepository },
        { provide: TenantRepository, useValue: mockTenantRepository },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
    userRepository = module.get(UserRepository);
    passwordHasher = module.get(PasswordHasher);
    membershipRepository = module.get(MembershipRepository);
    tenantRepository = module.get(TenantRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute - platform user', () => {
    it('should return scope=platform and nextStepHint=direct-login for platform user', async () => {
      const platformUser = createMockUser({
        id: 'user-platform-123',
        platformRoles: ['admin'],
      });

      userRepository.findByEmail.mockResolvedValue(platformUser);
      passwordHasher.compare.mockResolvedValue(true);

      const result = await useCase.execute({
        email: 'test@example.com',
        password: 'correct-password',
      });

      expect(result.scope).toBe('platform');
      expect(result.nextStepHint).toBe('direct-login');
      expect(result.availableContexts.tenants).toHaveLength(0);
    });
  });

  describe('execute - tenant user with single tenant', () => {
    it('should return scope=tenant and nextStepHint=direct-login for single tenant', async () => {
      const tenantUser = createMockUser({
        id: 'user-tenant-123',
        platformRoles: [],
      });

      const mockTenant = createMockTenant('tenant-1', 'Single Company');

      userRepository.findByEmail.mockResolvedValue(tenantUser);
      passwordHasher.compare.mockResolvedValue(true);
      membershipRepository.findByUserId.mockResolvedValue([
        { tenantId: 'tenant-1' } as unknown as Membership,
      ]);
      tenantRepository.findById.mockResolvedValue(mockTenant);

      const result = await useCase.execute({
        email: 'tenant@example.com',
        password: 'correct-password',
      });

      expect(result.scope).toBe('tenant');
      expect(result.nextStepHint).toBe('direct-login');
      expect(result.availableContexts.tenants).toHaveLength(1);
    });
  });

  describe('execute - tenant user with multiple tenants', () => {
    it('should return scope=tenant and nextStepHint=select-tenant for multiple tenants', async () => {
      const tenantUser = createMockUser({
        id: 'user-multi-123',
        platformRoles: [],
      });

      const tenant1 = createMockTenant('tenant-1', 'Company A');
      const tenant2 = createMockTenant('tenant-2', 'Company B');

      userRepository.findByEmail.mockResolvedValue(tenantUser);
      passwordHasher.compare.mockResolvedValue(true);
      membershipRepository.findByUserId.mockResolvedValue([
        { tenantId: 'tenant-1' } as unknown as Membership,
        { tenantId: 'tenant-2' } as unknown as Membership,
      ]);
      tenantRepository.findById
        .mockResolvedValueOnce(tenant1)
        .mockResolvedValueOnce(tenant2);

      const result = await useCase.execute({
        email: 'multi@example.com',
        password: 'correct-password',
      });

      expect(result.scope).toBe('tenant');
      expect(result.nextStepHint).toBe('select-tenant');
      expect(result.availableContexts.tenants).toHaveLength(2);
    });
  });

  describe('execute - invalid credentials', () => {
    it('should throw InvalidCredentialsError when user not found', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(
        useCase.execute({
          email: 'nonexistent@example.com',
          password: 'any-password',
        }),
      ).rejects.toThrow(InvalidCredentialsError);
    });

    it('should throw InvalidCredentialsError when password is invalid', async () => {
      const mockUser = createMockUser();
      userRepository.findByEmail.mockResolvedValue(mockUser);
      passwordHasher.compare.mockResolvedValue(false);

      await expect(
        useCase.execute({
          email: 'test@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(InvalidCredentialsError);
    });
  });
});