import { Test, TestingModule } from '@nestjs/testing';
import { MeUseCase, MeUseCaseResult } from './me.usecase';
import { UserRepository } from '@modules/users/domain/user.repository';
import { TenantRepository } from '@modules/tenants/domain/tenant.repository';
import { User } from '@modules/users/domain/user.entity';
import { Email } from '@core/domain/email.vo';
import { Tenant } from '@modules/tenants/domain/tenant.entity';

describe('MeUseCase', () => {
  let useCase: MeUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let tenantRepository: jest.Mocked<TenantRepository>;

  const createMockUser = (overrides: Partial<{ id: string; name: string; email: Email }> = {}) => {
    return {
      id: { value: overrides.id || 'user-123' },
      name: overrides.name || 'Test User',
      email: overrides.email || Email.from('test@example.com'),
    } as unknown as User;
  };

  const createMockTenant = (overrides: Partial<{ id: string; name: string }> = {}) => {
    return {
      id: { value: overrides.id || 'tenant-456' },
      name: overrides.name || 'Test Company',
    } as unknown as Tenant;
  };

  beforeEach(async () => {
    const mockUserRepository = {
      findById: jest.fn(),
    };

    const mockTenantRepository = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: TenantRepository, useValue: mockTenantRepository },
      ],
    }).compile();

    useCase = module.get<MeUseCase>(MeUseCase);
    userRepository = module.get(UserRepository);
    tenantRepository = module.get(TenantRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute - platform-only user', () => {
    it('should return user with tenant=null when tenantId is not provided', async () => {
      const mockUser = createMockUser({ id: 'user-platform-123' });
      userRepository.findById.mockResolvedValue(mockUser);

      const result = await useCase.execute('user-platform-123');

      expect(result.user).toBeDefined();
      expect(result.tenant).toBeNull();
    });

    it('should return user with tenant=null when platform user has no tenantId', async () => {
      const mockUser = createMockUser({ id: 'user-platform-456' });
      userRepository.findById.mockResolvedValue(mockUser);

      const result = await useCase.execute('user-platform-456', undefined);

      expect(result.user).toBeDefined();
      expect(result.tenant).toBeNull();
    });
  });

  describe('execute - tenant user', () => {
    it('should return user with tenant populated when tenantId is provided', async () => {
      const mockUser = createMockUser({ id: 'user-tenant-123' });
      const mockTenant = createMockTenant({ id: 'tenant-456', name: 'Acme Corp' });

      userRepository.findById.mockResolvedValue(mockUser);
      tenantRepository.findById.mockResolvedValue(mockTenant);

      const result = await useCase.execute('user-tenant-123', 'tenant-456');

      expect(result.user).toBeDefined();
      expect(result.tenant).toBeDefined();
      expect(result.tenant?.name).toBe('Acme Corp');
    });
  });

  describe('execute - user not found', () => {
    it('should throw Error when user is not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute('nonexistent-user'),
      ).rejects.toThrow('User not found');
    });
  });

  describe('execute - tenant not found', () => {
    it('should throw Error when tenant is not found', async () => {
      const mockUser = createMockUser({ id: 'user-tenant-123' });
      userRepository.findById.mockResolvedValue(mockUser);
      tenantRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute('user-tenant-123', 'nonexistent-tenant'),
      ).rejects.toThrow('Tenant not found');
    });
  });
});