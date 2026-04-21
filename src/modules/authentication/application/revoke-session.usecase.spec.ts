import { Test, TestingModule } from '@nestjs/testing';
import { RevokeSessionUseCase } from './revoke-session.usecase';
import { RefreshTokenService } from '@modules/authentication/domain/refresh-token.service';
import { PrismaService } from '@core/infra/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('RevokeSessionUseCase', () => {
  let useCase: RevokeSessionUseCase;
  let prismaService: jest.Mocked<PrismaService>;
  let refreshTokenService: jest.Mocked<RefreshTokenService>;

  beforeEach(async () => {
    const mockPrismaService = {
      session: {
        findUnique: jest.fn(),
      },
    };

    const mockRefreshTokenService = {
      revokeRefreshToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RevokeSessionUseCase,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: RefreshTokenService,
          useValue: mockRefreshTokenService,
        },
      ],
    }).compile();

    useCase = module.get<RevokeSessionUseCase>(RevokeSessionUseCase);
    prismaService = module.get(PrismaService);
    refreshTokenService = module.get(RefreshTokenService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const validSession = {
      id: 'session-123',
      userId: 'user-123',
      isRevoked: false,
      revokedAt: null,
    };

    beforeEach(() => {
      prismaService.session.findUnique.mockResolvedValue(validSession);
      refreshTokenService.revokeRefreshToken.mockResolvedValue(undefined);
    });

    it('should successfully revoke a session', async () => {
      const result = await useCase.execute('session-123', 'user-123');

      expect(result).toBeDefined();
      expect(result.sessionId).toBe('session-123');
      expect(result.revokedAt).toBeInstanceOf(Date);
      expect(prismaService.session.findUnique).toHaveBeenCalledWith({
        where: { id: 'session-123' },
        select: {
          id: true,
          userId: true,
          isRevoked: true,
          revokedAt: true,
        },
      });
      expect(refreshTokenService.revokeRefreshToken).toHaveBeenCalledWith(
        'session-123',
      );
    });

    it('should set revokedAt timestamp', async () => {
      const beforeTime = new Date();

      const result = await useCase.execute('session-123', 'user-123');

      expect(result.revokedAt.getTime()).toBeGreaterThanOrEqual(
        beforeTime.getTime(),
      );
    });
  });

  describe('error handling - session not found (404)', () => {
    it('should throw NotFoundException when session does not exist', async () => {
      prismaService.session.findUnique.mockResolvedValue(null);

      await expect(
        useCase.execute('non-existent-session', 'user-123'),
      ).rejects.toThrow(NotFoundException);

      await expect(
        useCase.execute('non-existent-session', 'user-123'),
      ).rejects.toMatchObject({
        response: {
          message: 'Session not found',
          code: 'SESSION_NOT_FOUND',
        },
      });
    });
  });

  describe('error handling - session belongs to another user (403)', () => {
    it('should throw ForbiddenException when session belongs to different user', async () => {
      const sessionFromAnotherUser = {
        id: 'session-123',
        userId: 'user-other',
        isRevoked: false,
        revokedAt: null,
      };

      prismaService.session.findUnique.mockResolvedValue(sessionFromAnotherUser);

      await expect(
        useCase.execute('session-123', 'user-123'),
      ).rejects.toThrow(ForbiddenException);

      await expect(
        useCase.execute('session-123', 'user-123'),
      ).rejects.toMatchObject({
        response: {
          message: 'You can only revoke your own sessions',
          code: 'SESSION_ACCESS_DENIED',
        },
      });
    });
  });

  describe('error handling - session already revoked (404)', () => {
    it('should throw NotFoundException when session is already revoked (isRevoked = true)', async () => {
      const alreadyRevokedSession = {
        id: 'session-123',
        userId: 'user-123',
        isRevoked: true,
        revokedAt: new Date(),
      };

      prismaService.session.findUnique.mockResolvedValue(alreadyRevokedSession);

      await expect(
        useCase.execute('session-123', 'user-123'),
      ).rejects.toThrow(NotFoundException);

      await expect(
        useCase.execute('session-123', 'user-123'),
      ).rejects.toMatchObject({
        response: {
          message: 'Session not found',
          code: 'SESSION_NOT_FOUND',
        },
      });
    });

    it('should throw NotFoundException when session has revokedAt set', async () => {
      const alreadyRevokedSession = {
        id: 'session-123',
        userId: 'user-123',
        isRevoked: false,
        revokedAt: new Date(),
      };

      prismaService.session.findUnique.mockResolvedValue(alreadyRevokedSession);

      await expect(
        useCase.execute('session-123', 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});