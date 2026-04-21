import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenUseCase } from './refresh-token.usecase';
import { RefreshTokenService } from '@modules/authentication/domain/refresh-token.service';
import { TokenService } from '@modules/authentication/domain/token.service';
import {
  InvalidOrExpiredRefreshTokenError,
  InvalidOrExpiredAccessTokenError,
  MissingTenantContextError,
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

  describe('execute', () => {
    const validAccessToken = 'valid-access-token';
    const validRefreshToken = 'valid-refresh-token';
    const newAccessToken = 'new-access-token';
    const newRefreshToken = 'new-refresh-token';

    const validPayload = {
      sub: 'user-123',
      tenantId: 'tenant-456',
    };

    beforeEach(() => {
      tokenService.verify.mockReturnValue(validPayload);
      refreshTokenService.rotateRefreshToken.mockResolvedValue({
        token: newRefreshToken,
        expiresAt: new Date(),
      });
      tokenService.sign.mockReturnValue(newAccessToken);
    });

    it('should successfully refresh tokens', async () => {
      const result = await useCase.execute(validRefreshToken, validAccessToken);

      expect(result).toBeDefined();
      expect(result.accessToken).toBe(newAccessToken);
      expect(result.refreshToken).toBe(newRefreshToken);
      expect(tokenService.verify).toHaveBeenCalledWith(validAccessToken);
      expect(refreshTokenService.rotateRefreshToken).toHaveBeenCalledWith(
        validRefreshToken,
      );
      expect(tokenService.sign).toHaveBeenCalledWith({
        sub: validPayload.sub,
        tenantId: validPayload.tenantId,
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
  });

  describe('error handling - missing tenant context', () => {
    it('should throw MissingTenantContextError when tenantId is missing', async () => {
      tokenService.verify.mockReturnValue({
        sub: 'user-123',
        tenantId: undefined as any,
      });

      await expect(
        useCase.execute('refresh-token', 'valid-access-token-no-tenant'),
      ).rejects.toThrow(MissingTenantContextError);
    });

    it('should throw MissingTenantContextError when tenantId is null', async () => {
      tokenService.verify.mockReturnValue({
        sub: 'user-123',
        tenantId: null as any,
      });

      await expect(
        useCase.execute('refresh-token', 'valid-access-token-null-tenant'),
      ).rejects.toThrow(MissingTenantContextError);
    });
  });

  describe('error handling - invalid/expired/revoked refresh token', () => {
    it('should throw InvalidOrExpiredRefreshTokenError when refresh token is invalid', async () => {
      tokenService.verify.mockReturnValue({
        sub: 'user-123',
        tenantId: 'tenant-456',
      });
      refreshTokenService.rotateRefreshToken.mockResolvedValue(null);

      await expect(
        useCase.execute('invalid-refresh-token', 'valid-access-token'),
      ).rejects.toThrow(InvalidOrExpiredRefreshTokenError);
    });

    it('should throw InvalidOrExpiredRefreshTokenError when refresh token is expired', async () => {
      tokenService.verify.mockReturnValue({
        sub: 'user-123',
        tenantId: 'tenant-456',
      });
      refreshTokenService.rotateRefreshToken.mockResolvedValue(null);

      await expect(
        useCase.execute('expired-refresh-token', 'valid-access-token'),
      ).rejects.toThrow(InvalidOrExpiredRefreshTokenError);
    });

    it('should throw InvalidOrExpiredRefreshTokenError when refresh token is revoked', async () => {
      tokenService.verify.mockReturnValue({
        sub: 'user-123',
        tenantId: 'tenant-456',
      });
      refreshTokenService.rotateRefreshToken.mockResolvedValue(null);

      await expect(
        useCase.execute('revoked-refresh-token', 'valid-access-token'),
      ).rejects.toThrow(InvalidOrExpiredRefreshTokenError);
    });
  });
});