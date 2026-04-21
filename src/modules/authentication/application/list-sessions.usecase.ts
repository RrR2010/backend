import { Injectable } from '@nestjs/common';
import { RefreshTokenService } from '@modules/authentication/domain/refresh-token.service';
import { SessionResponseDto } from '@modules/authentication/interface/session-response.dto';

@Injectable()
export class ListSessionsUseCase {
  constructor(private readonly refreshTokenService: RefreshTokenService) {}

  async execute(userId: string): Promise<{ sessions: SessionResponseDto[] }> {
    const sessions =
      await this.refreshTokenService.listSessionsByUserId(userId);

    const sessionDtos = sessions.map((session) =>
      SessionResponseDto.fromSession(session),
    );

    return {
      sessions: sessionDtos,
    };
  }
}
