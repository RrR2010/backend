import { Test, TestingModule } from '@nestjs/testing';
import { RevokeAllSessionsUseCase } from './revoke-all-sessions.usecase';
import { RefreshTokenService } from '@modules/authentication/domain/refresh-token.service';

describe('RevokeAllSessionsUseCase', () => {
  let useCase: RevokeAllSessionsUseCase;
  let refreshTokenService: jest.Mocked<RefreshTokenService>;

  beforeEach(async () => {
    const mockRefreshTokenService = {
      revokeAllSessions: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RevokeAllSessionsUseCase,
        {
          provide: RefreshTokenService,
          useValue: mockRefreshTokenService,
        },
      ],
    }).compile();

    useCase = module.get<RevokeAllSessionsUseCase>(RevokeAllSessionsUseCase);
    refreshTokenService = module.get(RefreshTokenService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully revoke all sessions', async () => {
      refreshTokenService.revokeAllSessions.mockResolvedValue(3);

      const result = await useCase.execute('user-123');

      expect(result).toBeDefined();
      expect(result.revokedCount).toBe(3);
      expect(result.revokedAt).toBeInstanceOf(Date);
      expect(refreshTokenService.revokeAllSessions).toHaveBeenCalledWith('user-123');
    });

    it('should return zero count when user has no sessions', async () => {
      refreshTokenService.revokeAllSessions.mockResolvedValue(0);

      const result = await useCase.execute('user-no-sessions');

      expect(result).toBeDefined();
      expect(result.revokedCount).toBe(0);
      expect(refreshTokenService.revokeAllSessions).toHaveBeenCalledWith(
        'user-no-sessions',
      );
    });

    it('should set revokedAt timestamp', async () => {
      const beforeTime = new Date();

      refreshTokenService.revokeAllSessions.mockResolvedValue(1);

      const result = await useCase.execute('user-123');

      expect(result.revokedAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
    });

    it('should revoke all sessions for user with multiple devices', async () => {
      refreshTokenService.revokeAllSessions.mockResolvedValue(5);

      const result = await useCase.execute('user-with-5-devices');

      expect(result).toBeDefined();
      expect(result.revokedCount).toBe(5);
    });
  });
});