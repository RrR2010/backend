import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@core/infra/prisma.service';
import { RefreshTokenService } from '@modules/authentication/domain/refresh-token.service';

export interface RevokeSessionResult {
  sessionId: string;
  revokedAt: Date;
}

@Injectable()
export class RevokeSessionUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async execute(
    sessionId: string,
    userId: string,
  ): Promise<RevokeSessionResult> {
    // Find the session to verify ownership
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        userId: true,
        isRevoked: true,
        revokedAt: true,
      },
    });

    // Session not found - return 404
    if (!session) {
      throw new NotFoundException({
        message: 'Session not found',
        code: 'SESSION_NOT_FOUND',
      });
    }

    // Session belongs to another user - return 403
    if (session.userId !== userId) {
      throw new ForbiddenException({
        message: 'You can only revoke your own sessions',
        code: 'SESSION_ACCESS_DENIED',
      });
    }

    // Session is already revoked
    if (session.isRevoked || session.revokedAt !== null) {
      throw new NotFoundException({
        message: 'Session not found',
        code: 'SESSION_NOT_FOUND',
      });
    }

    // Revoke the session
    await this.refreshTokenService.revokeRefreshToken(sessionId);

    return {
      sessionId,
      revokedAt: new Date(),
    };
  }
}
