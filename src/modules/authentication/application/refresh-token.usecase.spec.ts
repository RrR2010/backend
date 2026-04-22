import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenUseCase } from './refresh-token.usecase';
import { RefreshTokenService } from '@modules/authentication/domain/refresh-token.service';
import { TokenService, AuthScope } from '@modules/authentication/domain/token.service';
import {
  InvalidOrExpiredRefreshTokenError,
  InvalidOrExpiredAccessTokenError,
} from '@modules/authentication/domain/auth.errors';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let refreshTokenService: jest.Mocked<RefreshTokenService>;
  let tokenService: jest.Mocked<TokenService>;

  beforeEach(async () => {
    const mockRefreshTokenService = {
      rotateRefreshToken: jest.fn(),
    };

    const mockTokenService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenUseCase,
        {
          provide: RefreshTokenService,
          useValue: mockRefreshTokenService,
        },
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
      ],
    }).compile();

    useCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
    refreshTokenService = module.get(RefreshTokenService);
    tokenService = module.get(TokenService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute - tenant-scoped refresh', () => {
    const validAccessToken = 'valid-access-token';
    const validRefreshToken = 'valid-refresh-token';
    const newAccessToken = 'new-access-token';
    const newRefreshToken = 'new-refresh-token';

    const validTenantPayload = {
      sub: 'user-123',
      scope: AuthScope.Tenant,
      tenantId: 'tenant-456',
    };

    beforeEach(() => {
      tokenService.verify.mockReturnValue(validTenantPayload as any);
      refreshTokenService.rotateRefreshToken.mockResolvedValue({
        token: newRefreshToken,
        expiresAt: new Date(),
      });
      tokenService.sign.mockReturnValue(newAccessToken);
    });

    it('should successfully refresh tenant-scoped tokens', async () => {
      const result = await useCase.execute(validRefreshToken, validAccessToken);

      expect(result).toBeDefined();
      expect(result.accessToken).toBe(newAccessToken);
      expect(result.refreshToken).toBe(newRefreshToken);
      expect(tokenService.verify).toHaveBeenCalledWith(validAccessToken);
      expect(refreshTokenService.rotateRefreshToken).toHaveBeenCalledWith(
        validRefreshToken,
      );
      expect(tokenService.sign).toHaveBeenCalledWith({
        sub: validTenantPayload.sub,
        scope: AuthScope.Tenant,
        tenantId: validTenantPayload.tenantId,
      });
    });

    it('should refresh tenant-scoped token even without tenantId (stale token)', async () => {
      // Simulates: tenant was deleted, user has stale token
      tokenService.verify.mockReturnValue({
        sub: 'user-123',
        scope: AuthScope.Tenant,
        tenantId: undefined,
      } as any);

      const result = await useCase.execute(validRefreshToken, validAccessToken);

      expect(result).toBeDefined();
      expect(tokenService.sign).toHaveBeenCalledWith({
        sub: 'user-123',
        scope: AuthScope.Tenant,
        tenantId: undefined,
      });
    });
  });

  describe('execute - platform-scoped refresh', () => {
    const validAccessToken = 'valid-platform-access-token';
    const validRefreshToken = 'valid-platform-refresh-token';
    const newAccessToken = 'new-platform-access-token';
    const newRefreshToken = 'new-platform-refresh-token';

    const validPlatformPayload = {
      sub: 'user-123',
      scope: AuthScope.Platform,
      platformRoles: ['admin'],
    };

    beforeEach(() => {
      tokenService.verify.mockReturnValue(validPlatformPayload as any);
      refreshTokenService.rotateRefreshToken.mockResolvedValue({
        token: newRefreshToken,
        expiresAt: new Date(),
      });
      tokenService.sign.mockReturnValue(newAccessToken);
    });

    it('should successfully refresh platform-scoped tokens', async () => {
      const result = await useCase.execute(validRefreshToken, validAccessToken);

      expect(result).toBeDefined();
      expect(result.accessToken).toBe(newAccessToken);
      expect(result.refreshToken).toBe(newRefreshToken);
      expect(tokenService.sign).toHaveBeenCalledWith({
        sub: validPlatformPayload.sub,
        scope: AuthScope.Platform,
        platformRoles: validPlatformPayload.platformRoles,
      });
    });

    it('should preserve platformRoles on refresh', async () => {
      tokenService.verify.mockReturnValue({
        sub: 'user-123',
        scope: AuthScope.Platform,
        platformRoles: ['admin', 'manager'],
      } as any);

      const result = await useCase.execute(validRefreshToken, validAccessToken);

      expect(result).toBeDefined();
      expect(tokenService.sign).toHaveBeenCalledWith({
        sub: 'user-123',
        scope: AuthScope.Platform,
        platformRoles: ['admin', 'manager'],
      });
    });
  });

  describe('error handling - invalid/expired access token', () => {
    it('should throw InvalidOrExpiredAccessTokenError when access token is invalid', async () => {
      tokenService.verify.mockReturnValue(null);

      await expect(
        useCase.execute('refresh-token', 'invalid-access-token'),
      ).rejects.toThrow(InvalidOrExpiredAccessTokenError);
    });

    it('should throw InvalidOrExpiredAccessTokenError when access token is expired', async () => {
      tokenService.verify.mockReturnValue(null);

      await expect(
        useCase.execute('refresh-token', 'expired-access-token'),
      ).rejects.toThrow(InvalidOrExpiredAccessTokenError);
    });

    it('should throw InvalidOrExpiredAccessTokenError for unknown scope', async () => {
      tokenService.verify.mockReturnValue({
        sub: 'user-123',
        scope: 'unknown' as any,
      } as any);
      // Unknown scope should fail at scope validation, regardless of rotation result
      refreshTokenService.rotateRefreshToken.mockResolvedValue({
        token: 'new-refresh-token',
        expiresAt: new Date(),
      });

      await expect(
        useCase.execute('refresh-token', 'token-unknown-scope'),
      ).rejects.toThrow(InvalidOrExpiredAccessTokenError);
    });
  });

  describe('error handling - invalid/expired/revoked refresh token', () => {
    it('should throw InvalidOrExpiredRefreshTokenError when refresh token is invalid', async () => {
      tokenService.verify.mockReturnValue({
        sub: 'user-123',
        scope: AuthScope.Tenant,
        tenantId: 'tenant-456',
      } as any);
      refreshTokenService.rotateRefreshToken.mockResolvedValue(null);

      await expect(
        useCase.execute('invalid-refresh-token', 'valid-access-token'),
      ).rejects.toThrow(InvalidOrExpiredRefreshTokenError);
    });

    it('should throw InvalidOrExpiredRefreshTokenError when refresh token is expired', async () => {
      tokenService.verify.mockReturnValue({
        sub: 'user-123',
        scope: AuthScope.Tenant,
        tenantId: 'tenant-456',
      } as any);
      refreshTokenService.rotateRefreshToken.mockResolvedValue(null);

      await expect(
        useCase.execute('expired-refresh-token', 'valid-access-token'),
      ).rejects.toThrow(InvalidOrExpiredRefreshTokenError);
    });

    it('should throw InvalidOrExpiredRefreshTokenError when refresh token is revoked', async () => {
      tokenService.verify.mockReturnValue({
        sub: 'user-123',
        scope: AuthScope.Tenant,
        tenantId: 'tenant-456',
      } as any);
      refreshTokenService.rotateRefreshToken.mockResolvedValue(null);

      await expect(
        useCase.execute('revoked-refresh-token', 'valid-access-token'),
      ).rejects.toThrow(InvalidOrExpiredRefreshTokenError);
    });
  });
});