import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenService } from './refresh-token.service';
import { PrismaService } from '@core/infra/prisma.service';

describe('RefreshTokenService', () => {
  let service: RefreshTokenService;
  let prismaService: Partial<PrismaService>;

  const mockSession = {
    id: 'session-123',
    userId: 'user-123',
    refreshTokenHash:
      'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
    deviceInfo: 'test-device',
    ipAddress: '127.0.0.1',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    revokedAt: null,
    isRevoked: false,
  };

  beforeEach(async () => {
    prismaService = {
      session: {
        create: jest.fn().mockResolvedValue(mockSession),
        findFirst: jest.fn().mockResolvedValue(null),
        update: jest
          .fn()
          .mockResolvedValue({ ...mockSession, isRevoked: true }),
      },
    } as unknown as PrismaService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    service = module.get<RefreshTokenService>(RefreshTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateRefreshToken', () => {
    it('should generate a cryptographically secure token', () => {
      const token = service.generateRefreshToken();

      expect(token).toBeDefined();
      expect(token).toHaveLength(64);
      expect(token).toMatch(/^[a-f0-9]+$/);
    });

    it('should generate unique tokens', () => {
      const token1 = service.generateRefreshToken();
      const token2 = service.generateRefreshToken();

      expect(token1).not.toEqual(token2);
    });
  });

  describe('saveRefreshToken', () => {
    it('should save refresh token with correct data', async () => {
      const userId = 'user-123';
      const token = service.generateRefreshToken();
      const deviceInfo = 'test-device';
      const ipAddress = '127.0.0.1';

      const result = await service.saveRefreshToken(
        userId,
        token,
        deviceInfo,
        ipAddress,
      );

      expect(result).toBeDefined();
      expect(result.token).toBe(token);
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(prismaService.session.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId,
          refreshTokenHash: expect.any(String),
          deviceInfo,
          ipAddress,
          isRevoked: false,
        }),
      });
    });

    it('should store SHA-256 hash of token', async () => {
      const token = 'test-token-123';
      const crypto = require('crypto');
      const expectedHash = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      await service.saveRefreshToken('user-123', token);

      expect(prismaService.session.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          refreshTokenHash: expectedHash,
        }),
      });
    });
  });

  describe('validateRefreshToken', () => {
    it('should return null for non-existent token', async () => {
      const result = await service.validateRefreshToken('non-existent-token');

      expect(result).toBeNull();
    });

    it('should validate a valid active token', async () => {
      (prismaService.session as any).findFirst = jest
        .fn()
        .mockResolvedValue(mockSession);

      const result = await service.validateRefreshToken('test-token');

      expect(result).toBeDefined();
      expect(result?.isValid).toBe(true);
      expect(result?.isExpired).toBe(false);
      expect(result?.isRevoked).toBe(false);
      expect(result?.sessionId).toBe('session-123');
      expect(result?.userId).toBe('user-123');
    });

    it('should detect expired token', async () => {
      const expiredSession = {
        ...mockSession,
        expiresAt: new Date(Date.now() - 1000),
      };

      (prismaService.session as any).findFirst = jest
        .fn()
        .mockResolvedValue(expiredSession);

      const result = await service.validateRefreshToken('test-token');

      expect(result?.isValid).toBe(false);
      expect(result?.isExpired).toBe(true);
    });

    it('should detect revoked token', async () => {
      const revokedSession = {
        ...mockSession,
        isRevoked: true,
        revokedAt: new Date(),
      };

      (prismaService.session as any).findFirst = jest
        .fn()
        .mockResolvedValue(revokedSession);

      const result = await service.validateRefreshToken('test-token');

      expect(result?.isValid).toBe(false);
      expect(result?.isRevoked).toBe(true);
    });
  });

  describe('rotateRefreshToken', () => {
    it('should rotate a valid token', async () => {
      (prismaService.session as any).findFirst = jest
        .fn()
        .mockResolvedValue(mockSession);

      const result = await service.rotateRefreshToken(
        'test-token',
        'new-device',
        '192.168.1.1',
      );

      expect(result).toBeDefined();
      expect(result?.token).not.toEqual('test-token');
      expect(prismaService.session.update).toHaveBeenCalledWith({
        where: { id: 'session-123' },
        data: expect.objectContaining({
          isRevoked: true,
          revokedAt: expect.any(Date),
        }),
      });
    });

    it('should return null for invalid token', async () => {
      (prismaService.session as any).findFirst = jest
        .fn()
        .mockResolvedValue(null);

      const result = await service.rotateRefreshToken('invalid-token');

      expect(result).toBeNull();
    });

    it('should return null for expired token', async () => {
      const expiredSession = {
        ...mockSession,
        expiresAt: new Date(Date.now() - 1000),
      };

      (prismaService.session as any).findFirst = jest
        .fn()
        .mockResolvedValue(expiredSession);

      const result = await service.rotateRefreshToken('expired-token');

      expect(result).toBeNull();
    });

    it('should return null for revoked token', async () => {
      const revokedSession = {
        ...mockSession,
        isRevoked: true,
        revokedAt: new Date(),
      };

      (prismaService.session as any).findFirst = jest
        .fn()
        .mockResolvedValue(revokedSession);

      const result = await service.rotateRefreshToken('revoked-token');

      expect(result).toBeNull();
    });
  });

  describe('revokeRefreshToken', () => {
    it('should revoke a session', async () => {
      await service.revokeRefreshToken('session-123');

      expect(prismaService.session.update).toHaveBeenCalledWith({
        where: { id: 'session-123' },
        data: expect.objectContaining({
          isRevoked: true,
          revokedAt: expect.any(Date),
        }),
      });
    });
  });

  describe('listSessionsByUserId', () => {
    beforeEach(() => {
      prismaService.session = {
        ...prismaService.session,
        findMany: jest.fn().mockResolvedValue([]),
      } as any;
    });

    it('should list active sessions for a user', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          userId: 'user-123',
          deviceInfo: 'Chrome',
          ipAddress: '192.168.1.1',
          createdAt: new Date(),
          lastUsedAt: new Date(),
          expiresAt: new Date(Date.now() + 86400000),
          isRevoked: false,
          revokedAt: null,
        },
        {
          id: 'session-2',
          userId: 'user-123',
          deviceInfo: 'Firefox',
          ipAddress: '192.168.1.2',
          createdAt: new Date(),
          lastUsedAt: new Date(),
          expiresAt: new Date(Date.now() + 86400000),
          isRevoked: false,
          revokedAt: null,
        },
      ];

      (prismaService.session as any).findMany = jest
        .fn()
        .mockResolvedValue(mockSessions);

      const result = await service.listSessionsByUserId('user-123');

      expect(result).toHaveLength(2);
      expect(prismaService.session.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          isRevoked: false,
          revokedAt: null,
        },
        orderBy: {
          lastUsedAt: 'desc',
        },
        select: {
          id: true,
          deviceInfo: true,
          ipAddress: true,
          createdAt: true,
          lastUsedAt: true,
          expiresAt: true,
          isRevoked: true,
          revokedAt: true,
        },
      });
    });

    it('should return empty array when user has no sessions', async () => {
      (prismaService.session as any).findMany = jest
        .fn()
        .mockResolvedValue([]);

      const result = await service.listSessionsByUserId('user-no-sessions');

      expect(result).toHaveLength(0);
    });

    it('should exclude revoked sessions', async () => {
      const mockSessions = [
        {
          id: 'session-active',
          userId: 'user-123',
          deviceInfo: 'Chrome',
          ipAddress: '192.168.1.1',
          createdAt: new Date(),
          lastUsedAt: new Date(),
          expiresAt: new Date(Date.now() + 86400000),
          isRevoked: false,
          revokedAt: null,
        },
      ];

      (prismaService.session as any).findMany = jest
        .fn()
        .mockResolvedValue(mockSessions);

      const result = await service.listSessionsByUserId('user-123');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('session-active');
    });
  });

  describe('listAllSessionsByUserId', () => {
    beforeEach(() => {
      prismaService.session = {
        ...prismaService.session,
        findMany: jest.fn().mockResolvedValue([]),
      } as any;
    });

    it('should list all sessions including revoked for admin', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          userId: 'user-123',
          deviceInfo: 'Chrome',
          ipAddress: '192.168.1.1',
          createdAt: new Date(),
          lastUsedAt: new Date(),
          expiresAt: new Date(Date.now() + 86400000),
          isRevoked: false,
          revokedAt: null,
        },
        {
          id: 'session-2',
          userId: 'user-123',
          deviceInfo: 'Firefox',
          ipAddress: '192.168.1.2',
          createdAt: new Date(),
          lastUsedAt: new Date(),
          expiresAt: new Date(Date.now() + 86400000),
          isRevoked: true,
          revokedAt: new Date(),
        },
      ];

      (prismaService.session as any).findMany = jest
        .fn()
        .mockResolvedValue(mockSessions);

      const result = await service.listAllSessionsByUserId('user-123');

      expect(result).toHaveLength(2);
      expect(prismaService.session.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
        },
        orderBy: {
          lastUsedAt: 'desc',
        },
        select: {
          id: true,
          deviceInfo: true,
          ipAddress: true,
          createdAt: true,
          lastUsedAt: true,
          expiresAt: true,
          isRevoked: true,
          revokedAt: true,
        },
      });
    });
  });

  describe('revokeAllSessions', () => {
    beforeEach(() => {
      prismaService.session = {
        ...prismaService.session,
        updateMany: jest.fn().mockResolvedValue({ count: 3 }),
      } as any;
    });

    it('should revoke all sessions for a user', async () => {
      const result = await service.revokeAllSessions('user-123');

      expect(result).toBe(3);
      expect(prismaService.session.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          isRevoked: false,
          revokedAt: null,
        },
        data: {
          isRevoked: true,
          revokedAt: expect.any(Date),
        },
      });
    });

    it('should return 0 when no sessions to revoke', async () => {
      (prismaService.session as any).updateMany = jest
        .fn()
        .mockResolvedValue({ count: 0 });

      const result = await service.revokeAllSessions('user-no-sessions');

      expect(result).toBe(0);
    });
  });

  describe('security features', () => {
    it('should generate tokens with sufficient entropy', () => {
      const tokens = new Set<string>();
      for (let i = 0; i < 100; i++) {
        tokens.add(service.generateRefreshToken());
      }

      expect(tokens.size).toBe(100);
    });

    it('should use SHA-256 for hashing', () => {
      const crypto = require('crypto');
      const testToken = 'test-token';
      const expectedHash = crypto
        .createHash('sha256')
        .update(testToken)
        .digest('hex');

      const serviceAny = service as any;
      const actualHash = serviceAny.hashToken(testToken);

      expect(actualHash).toBe(expectedHash);
    });
  });
});
