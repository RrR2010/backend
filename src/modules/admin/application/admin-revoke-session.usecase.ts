import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@core/infra/prisma.service';
import { RefreshTokenService } from '@modules/authentication/domain/refresh-token.service';

export interface AdminRevokeSessionResult {
  sessionId: string;
  revokedAt: Date;
}

@Injectable()
export class AdminRevokeSessionUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async execute(
    sessionId: string,
    userId: string,
  ): Promise<AdminRevokeSessionResult> {
    // Find the session to verify it belongs to the user
    const session = await this.prisma.session.findFirst({
      where: {
        id: sessionId,
        userId: userId,
        isRevoked: false,
      },
      select: {
        id: true,
        userId: true,
        isRevoked: true,
        revokedAt: true,
      },
    });

    // Session not found
    if (!session) {
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
