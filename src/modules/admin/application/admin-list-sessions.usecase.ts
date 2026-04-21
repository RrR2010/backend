import { Injectable, NotFoundException } from '@nestjs/common';
import { RefreshTokenService } from '@modules/authentication/domain/refresh-token.service';
import { SessionResponseDto } from '@modules/authentication/interface/session-response.dto';
import { PrismaService } from '@core/infra/prisma.service';

@Injectable()
export class AdminListSessionsUseCase {
  constructor(
    private readonly refreshTokenService: RefreshTokenService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    userId: string,
  ): Promise<{ sessions: SessionResponseDto[]; userId: string }> {
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

    const sessions =
      await this.refreshTokenService.listAllSessionsByUserId(userId);

    const sessionDtos = sessions.map((session) =>
      SessionResponseDto.fromSession(session),
    );

    return {
      sessions: sessionDtos,
      userId,
    };
  }
}
