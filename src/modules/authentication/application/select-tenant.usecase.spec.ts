import { Test, TestingModule } from '@nestjs/testing';
import { SelectTenantUseCase, SelectTenantResult } from './select-tenant.usecase';
import { MembershipRepository } from '@modules/memberships/domain/membership.repository';
import { TokenService, AuthScope } from '@modules/authentication/domain/token.service';
import { RefreshTokenService } from '@modules/authentication/domain/refresh-token.service';
import {
  UserHasNoMembershipsError,
  UserDoesNotHaveAccessToTenantError,
} from '@modules/authentication/domain/auth.errors';
import { Membership } from '@modules/memberships/domain/membership.entity';

describe('SelectTenantUseCase', () => {
  let useCase: SelectTenantUseCase;
  let membershipRepository: jest.Mocked<MembershipRepository>;
  let tokenService: jest.Mocked<TokenService>;
  let refreshTokenService: jest.Mocked<RefreshTokenService>;

  beforeEach(async () => {
    const mockMembershipRepository = {
      findByUserId: jest.fn(),
    };

    const mockTokenService = {
      sign: jest.fn(),
    };

    const mockRefreshTokenService = {
      generateRefreshToken: jest.fn(),
      saveRefreshToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SelectTenantUseCase,
        { provide: MembershipRepository, useValue: mockMembershipRepository },
        { provide: TokenService, useValue: mockTokenService },
        { provide: RefreshTokenService, useValue: mockRefreshTokenService },
      ],
    }).compile();

    useCase = module.get<SelectTenantUseCase>(SelectTenantUseCase);
    membershipRepository = module.get(MembershipRepository);
    tokenService = module.get(TokenService);
    refreshTokenService = module.get(RefreshTokenService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute - valid tenant selection', () => {
    const userId = 'user-123';
    const tenantId = 'tenant-456';
    const deviceInfo = 'Mozilla/5.0';
    const ipAddress = '192.168.1.1';

    beforeEach(() => {
      tokenService.sign.mockReturnValue('access-token');
      refreshTokenService.generateRefreshToken.mockReturnValue('refresh-token-string');
      refreshTokenService.saveRefreshToken.mockResolvedValue({
        token: 'refresh-token-string',
        expiresAt: new Date(),
      });
    });

    it('should successfully select a valid tenant and return tokens', async () => {
      const mockMemberships = [
        { tenantId: 'tenant-456' } as unknown as Membership,
      ];
      membershipRepository.findByUserId.mockResolvedValue(mockMemberships);

      const result = await useCase.execute(userId, tenantId, deviceInfo, ipAddress);

      expect(result).toBeDefined();
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token-string');
      expect(tokenService.sign).toHaveBeenCalledWith({
        sub: userId,
        scope: AuthScope.Tenant,
        tenantId: tenantId,
      });
      expect(refreshTokenService.saveRefreshToken).toHaveBeenCalledWith(
        userId,
        'refresh-token-string',
        deviceInfo,
        ipAddress,
      );
    });
  });

  describe('execute - invalid tenant (no access)', () => {
    const userId = 'user-123';
    const tenantId = 'tenant-invalid';

    it('should throw UserDoesNotHaveAccessToTenantError when user has no membership for tenant', async () => {
      const mockMemberships = [
        { tenantId: 'tenant-456' } as unknown as Membership,
      ];
      membershipRepository.findByUserId.mockResolvedValue(mockMemberships);

      await expect(
        useCase.execute(userId, tenantId),
      ).rejects.toThrow(UserDoesNotHaveAccessToTenantError);
    });
  });

  describe('execute - user has no memberships', () => {
    const userId = 'user-no-memberships';
    const tenantId = 'tenant-456';

    it('should throw UserHasNoMembershipsError when user has no memberships', async () => {
      membershipRepository.findByUserId.mockResolvedValue(null);

      await expect(
        useCase.execute(userId, tenantId),
      ).rejects.toThrow(UserHasNoMembershipsError);
    });

    it('should throw UserDoesNotHaveAccessToTenantError when user has empty memberships array', async () => {
      // When memberships is an empty array, find() returns undefined
      // which causes the code to throw UserDoesNotHaveAccessToTenantError
      membershipRepository.findByUserId.mockResolvedValue([]);

      await expect(
        useCase.execute(userId, tenantId),
      ).rejects.toThrow(UserDoesNotHaveAccessToTenantError);
    });
  });
});