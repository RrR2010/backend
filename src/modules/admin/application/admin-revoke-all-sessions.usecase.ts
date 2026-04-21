import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { RefreshTokenService } from '@modules/authentication/domain/refresh-token.service';
import { PrismaService } from '@core/infra/prisma.service';

export interface AdminRevokeAllSessionsResult {
  userId: string;
  revokedCount: number;
  revokedAt: Date;
}

@Injectable()
export class AdminRevokeAllSessionsUseCase {
  private readonly logger = new Logger(AdminRevokeAllSessionsUseCase.name);

  constructor(
    private readonly refreshTokenService: RefreshTokenService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(userId: string): Promise<AdminRevokeAllSessionsResult> {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    this.logger.log({
      message: 'Admin revoking all sessions for user',
      userId,
      action: 'ADMIN_REVOKE_ALL_SESSIONS',
    });

    const revokedCount =
      await this.refreshTokenService.revokeAllSessions(userId);

    this.logger.log({
      message: 'All sessions revoked successfully by admin',
      userId,
      revokedCount,
      action: 'ADMIN_REVOKE_ALL_SESSIONS',
    });

    return {
      userId,
      revokedCount,
      revokedAt: new Date(),
    };
  }
}
