import { Injectable, Logger } from '@nestjs/common';
import { RefreshTokenService } from '@modules/authentication/domain/refresh-token.service';

export interface RevokeAllSessionsResult {
  revokedCount: number;
  revokedAt: Date;
}

@Injectable()
export class RevokeAllSessionsUseCase {
  private readonly logger = new Logger(RevokeAllSessionsUseCase.name);

  constructor(private readonly refreshTokenService: RefreshTokenService) {}

  async execute(userId: string): Promise<RevokeAllSessionsResult> {
    this.logger.log({
      message: 'Revoking all sessions for user',
      userId,
      action: 'REVOKE_ALL_SESSIONS',
    });

    const revokedCount =
      await this.refreshTokenService.revokeAllSessions(userId);

    this.logger.log({
      message: 'All sessions revoked successfully',
      userId,
      revokedCount,
      action: 'REVOKE_ALL_SESSIONS',
    });

    return {
      revokedCount,
      revokedAt: new Date(),
    };
  }
}
