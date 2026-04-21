import { Test, TestingModule } from '@nestjs/testing';
import { ListSessionsUseCase } from './list-sessions.usecase';
import { RefreshTokenService } from '@modules/authentication/domain/refresh-token.service';
import { SessionResponseDto } from '@modules/authentication/interface/session-response.dto';

describe('ListSessionsUseCase', () => {
  let useCase: ListSessionsUseCase;
  let refreshTokenService: jest.Mocked<RefreshTokenService>;

  beforeEach(async () => {
    const mockRefreshTokenService = {
      listSessionsByUserId: jest.fn(),
      listAllSessionsByUserId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListSessionsUseCase,
        {
          provide: RefreshTokenService,
          useValue: mockRefreshTokenService,
        },
      ],
    }).compile();

    useCase = module.get<ListSessionsUseCase>(ListSessionsUseCase);
    refreshTokenService = module.get(RefreshTokenService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully list sessions', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          deviceInfo: 'Chrome/120.0',
          ipAddress: '192.168.1.100',
          createdAt: new Date('2026-04-20T10:00:00Z'),
          lastUsedAt: new Date('2026-04-20T15:30:00Z'),
          isRevoked: false,
          revokedAt: null,
        },
        {
          id: 'session-2',
          deviceInfo: 'Firefox/118.0',
          ipAddress: '192.168.1.101',
          createdAt: new Date('2026-04-19T10:00:00Z'),
          lastUsedAt: new Date('2026-04-20T12:00:00Z'),
          isRevoked: false,
          revokedAt: null,
        },
      ];

      refreshTokenService.listSessionsByUserId.mockResolvedValue(mockSessions);

      const result = await useCase.execute('user-123');

      expect(result).toBeDefined();
      expect(result.sessions).toHaveLength(2);
      expect(refreshTokenService.listSessionsByUserId).toHaveBeenCalledWith(
        'user-123',
      );
      expect(result.sessions[0].id).toBe('session-1');
      expect(result.sessions[1].id).toBe('session-2');
    });

    it('should return empty array when user has no sessions', async () => {
      refreshTokenService.listSessionsByUserId.mockResolvedValue([]);

      const result = await useCase.execute('user-no-sessions');

      expect(result).toBeDefined();
      expect(result.sessions).toHaveLength(0);
      expect(refreshTokenService.listSessionsByUserId).toHaveBeenCalledWith(
        'user-no-sessions',
      );
    });

    it('should map sessions to DTOs correctly', async () => {
      const session = {
        id: 'session-1',
        deviceInfo: 'Chrome/120.0',
        ipAddress: '192.168.1.100',
        createdAt: new Date(),
        lastUsedAt: new Date(),
        isRevoked: false,
        revokedAt: null,
      };

      refreshTokenService.listSessionsByUserId.mockResolvedValue([session]);

      const result = await useCase.execute('user-123');

      expect(result.sessions[0]).toBeInstanceOf(SessionResponseDto);
      expect(result.sessions[0].id).toBe('session-1');
      expect(result.sessions[0].deviceInfo).toBe('Chrome/120.0');
      expect(result.sessions[0].ipAddress).toBe('192.168.1.100');
      expect(result.sessions[0].isActive).toBe(true);
    });

    it('should correctly mark revoked sessions as inactive', async () => {
      const session = {
        id: 'session-revoked',
        deviceInfo: 'Chrome/120.0',
        ipAddress: '192.168.1.100',
        createdAt: new Date(),
        lastUsedAt: new Date(),
        isRevoked: true,
        revokedAt: new Date(),
      };

      refreshTokenService.listSessionsByUserId.mockResolvedValue([session]);

      const result = await useCase.execute('user-123');

      expect(result.sessions[0].isActive).toBe(false);
    });
  });
});