import {
  Controller,
  Get,
  Delete,
  Param,
  HttpCode,
  Post,
  Body,
  Headers,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiSecurity, ApiParam } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '@modules/users/domain/user.repository';
import { PasswordHasher } from '@modules/authentication/domain/password-hasher';
import { Email } from '@core/domain/email.vo';
import { PlatformRole } from '@core/domain/authorization';
import { User } from '@modules/users/domain/user.entity';
import { AdminListSessionsUseCase } from '../application/admin-list-sessions.usecase';
import { AdminRevokeSessionUseCase } from '../application/admin-revoke-session.usecase';
import { AdminRevokeAllSessionsUseCase } from '../application/admin-revoke-all-sessions.usecase';
import { ListSessionsResponseDto } from '@modules/authentication/interface/session-response.dto';
import { BootstrapAdminDto } from './bootstrap-admin.dto';
import { Authorize, Public } from '@modules/authorization/interface/authorization.decorator';
import { PermissionAction, PermissionSubject } from '@core/domain/authorization';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly adminListSessionsUseCase: AdminListSessionsUseCase,
    private readonly adminRevokeSessionUseCase: AdminRevokeSessionUseCase,
    private readonly adminRevokeAllSessionsUseCase: AdminRevokeAllSessionsUseCase,
  ) {}

  @Post('bootstrap')
  @Public()
  @HttpCode(201)
  async bootstrap(
    @Headers('x-bootstrap-key') key: string,
    @Body() dto: BootstrapAdminDto,
  ): Promise<{
    id: string;
    email: string;
    name: string;
    platformRoles: string[];
  }> {
    const bootstrapKey = this.configService.get<string>(
      'ADMIN_BOOTSTRAP_SECRET',
    );
    if (key !== bootstrapKey) {
      throw new UnauthorizedException('Invalid bootstrap key');
    }

    const userCount = await this.userRepository.count();
    if (userCount > 0) {
      throw new ForbiddenException(
        'Bootstrap not allowed: users already exist',
      );
    }

    const hashedPassword = await this.passwordHasher.hash(dto.password);
    const admin = User.create({
      email: Email.from(dto.email),
      passwordHash: hashedPassword,
      name: dto.name,
      code: null,
      platformRoles: [PlatformRole.ADMIN],
    });

    const saved = await this.userRepository.save(admin);

    return {
      id: saved.id.value,
      email: saved.email.value,
      name: saved.name,
      platformRoles: saved.platformRoles,
    };
  }

  @Get('users/:userId/sessions')
  @Authorize({
    permission: { action: PermissionAction.Read, subject: PermissionSubject.User },
    requireAll: true,
  })
  @ApiBearerAuth('accessToken')
  @ApiSecurity('accessToken')
  @ApiParam({
    name: 'userId',
    description: 'User ID to list sessions for',
    type: String,
  })
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
  @Authorize({
    permission: { action: PermissionAction.Delete, subject: PermissionSubject.User },
    requireAll: true,
  })
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
  @Authorize({
    permission: { action: PermissionAction.Delete, subject: PermissionSubject.User },
    requireAll: true,
  })
  @ApiBearerAuth('accessToken')
  @ApiSecurity('accessToken')
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    type: String,
  })
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
