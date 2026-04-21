import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiSecurity,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/authentication/infra/jwt-auth.guard';
import { AdminListSessionsUseCase } from '../application/admin-list-sessions.usecase';
import { AdminRevokeSessionUseCase } from '../application/admin-revoke-session.usecase';
import { AdminRevokeAllSessionsUseCase } from '../application/admin-revoke-all-sessions.usecase';
import { ListSessionsResponseDto } from '@modules/authentication/interface/session-response.dto';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminListSessionsUseCase: AdminListSessionsUseCase,
    private readonly adminRevokeSessionUseCase: AdminRevokeSessionUseCase,
    private readonly adminRevokeAllSessionsUseCase: AdminRevokeAllSessionsUseCase,
  ) {}

  @Get('users/:userId/sessions')
  @ApiBearerAuth('accessToken')
  @ApiSecurity('accessToken')
  @ApiParam({
    name: 'userId',
    description: 'User ID to list sessions for',
    type: String,
  })
  @UseGuards(JwtAuthGuard)
  async listUserSessions(
    @Param('userId') userId: string,
  ): Promise<ListSessionsResponseDto & { userId: string }> {
    const result = await this.adminListSessionsUseCase.execute(userId);

    return {
      userId: result.userId,
      sessions: result.sessions,
    };
  }

  @Delete('users/:userId/sessions/:sessionId')
  @ApiBearerAuth('accessToken')
  @ApiSecurity('accessToken')
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    type: String,
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Session ID to revoke',
    type: String,
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async revokeUserSession(
    @Param('userId') userId: string,
    @Param('sessionId') sessionId: string,
  ): Promise<{ sessionId: string; revokedAt: Date }> {
    const result = await this.adminRevokeSessionUseCase.execute(
      sessionId,
      userId,
    );

    return {
      sessionId: result.sessionId,
      revokedAt: result.revokedAt,
    };
  }

  @Delete('users/:userId/sessions')
  @ApiBearerAuth('accessToken')
  @ApiSecurity('accessToken')
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    type: String,
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async revokeAllUserSessions(
    @Param('userId') userId: string,
  ): Promise<{ userId: string; revokedCount: number; revokedAt: Date }> {
    const result = await this.adminRevokeAllSessionsUseCase.execute(userId);

    return {
      userId: result.userId,
      revokedCount: result.revokedCount,
      revokedAt: result.revokedAt,
    };
  }
}
