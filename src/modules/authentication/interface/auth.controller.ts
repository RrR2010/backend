import {
  Body,
  Controller,
  Post,
  Get,
  Delete,
  Res,
  Req,
  Param,
  UseGuards,
  HttpCode,
  Logger,
} from '@nestjs/common';
import {
  ApiConsumes,
  ApiSecurity,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LoginDto } from './login.dto';
import { LoginUseCase } from '@modules/authentication/application/login.usecase';
import { SelectTenantUseCase } from '@modules/authentication/application/select-tenant.usecase';
import { MeUseCase } from '@modules/authentication/application/me.usecase';
import { RefreshTokenUseCase } from '@modules/authentication/application/refresh-token.usecase';
import { SelectTenantDto } from './select-tenant.dto';
import { SelectTenantResponseDto } from './select-tenant-response.dto';
import {
  TokenService,
  AuthTokenPayload,
} from '@modules/authentication/domain/token.service';
import { JwtAuthGuard } from '@modules/authentication/infra/jwt-auth.guard';
import { TenantContextGuard } from '@modules/authentication/infra/tenant-context.guard';
import type { Request, Response } from 'express';
import {
  InvalidOrExpiredRefreshTokenError,
  InvalidOrExpiredPreAuthTokenError,
} from '@modules/authentication/domain/auth.errors';
import { Membership } from '@modules/memberships/domain/membership.entity';
import { MeResponseDto } from './me-response.dto';
import { ListSessionsUseCase } from '@modules/authentication/application/list-sessions.usecase';
import { RevokeSessionUseCase } from '@modules/authentication/application/revoke-session.usecase';
import { RevokeAllSessionsUseCase } from '@modules/authentication/application/revoke-all-sessions.usecase';
import { ListSessionsResponseDto } from './session-response.dto';
import { RefreshTokenService } from '@modules/authentication/domain/refresh-token.service';
import { LoginResponseDto } from './login-response.dto';
import { SessionService } from '@modules/authentication/infra/session.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private loginUseCase: LoginUseCase,
    private selectTenantUseCase: SelectTenantUseCase,
    private meUseCase: MeUseCase,
    private refreshTokenUseCase: RefreshTokenUseCase,
    private listSessionsUseCase: ListSessionsUseCase,
    private revokeSessionUseCase: RevokeSessionUseCase,
    private revokeAllSessionsUseCase: RevokeAllSessionsUseCase,
    private jwtService: TokenService,
    private refreshTokenService: RefreshTokenService,
    private sessionService: SessionService,
  ) {}

  /**
   * Login endpoint.
   *
   * Returns unified result with explicit scope and nextStepHint:
   * - Platform user: scope=platform, nextStepHint=direct-login -> tokens issued immediately
   * - Tenant user: scope=tenant, nextStepHint=select-tenant -> require tenant selection first
   */
  @Post('login')
  @ApiConsumes('application/json')
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() input: LoginDto,
  ): Promise<LoginResponseDto> {
    // Extract device info from headers
    const deviceInfo = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket?.remoteAddress || undefined;

    const result = await this.loginUseCase.execute({
      email: input.email,
      password: input.password,
      ...(deviceInfo && { deviceInfo }),
      ...(ipAddress && { ipAddress }),
    });

    // Use sessionService for token issuance based on scope
    if (result.scope === 'platform') {
      // Platform user - create full platform session
      await this.sessionService.createPlatformSession(
        res,
        result.user,
        deviceInfo,
        ipAddress,
      );

      return {
        user: result.user,
        scope: result.scope,
        availableContexts: result.availableContexts,
        nextStepHint: result.nextStepHint,
      };
    }

    // Tenant user - create pre-auth session for tenant selection
    await this.sessionService.createPreAuthSession(res, result.user);

    return {
      user: result.user,
      scope: result.scope,
      availableContexts: result.availableContexts,
      nextStepHint: result.nextStepHint,
    };
  }

  @Post('select-tenant')
  @ApiConsumes('application/json')
  @ApiSecurity('preAuthToken')
  async selectTenant(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() input: SelectTenantDto,
  ): Promise<SelectTenantResponseDto | { membership: Membership | undefined }> {
    const preAuthToken = req.cookies?.preAuthToken as string | undefined;

    if (!preAuthToken) {
      throw new InvalidOrExpiredPreAuthTokenError();
    }

    const payload = this.jwtService.verifyPreAuth(preAuthToken);
    if (!payload || payload.type !== 'pre-auth') {
      throw new InvalidOrExpiredPreAuthTokenError();
    }

    // Extract device info from request
    const deviceInfo = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket?.remoteAddress || undefined;

    const result = await this.selectTenantUseCase.execute(
      payload.sub,
      input.tenantId,
      deviceInfo,
      ipAddress,
    );

    // Set tokens from use case result using sessionService cookie configuration
    // Note: Token generation stays in use case to maintain consistency
    // Cookie config is centralized in sessionService
    this.sessionService.setTokensFromUseCase(
      res,
      result.accessToken,
      result.refreshToken,
    );
    res.clearCookie('preAuthToken');

    return result;
  }

  @Post('logout')
  @ApiConsumes('application/json')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken as string;
      if (refreshToken) {
        const validation =
          await this.refreshTokenService.validateRefreshToken(refreshToken);
        if (validation && validation.sessionId) {
          await this.refreshTokenService.revokeRefreshToken(
            validation.sessionId,
          );
        }
      }
    } catch (error) {
      Logger.error(error);
    } finally {
      this.sessionService.clearAllSessionCookies(res);
    }
  }

  @Get('sessions')
  @ApiBearerAuth('accessToken')
  @ApiSecurity('accessToken')
  @UseGuards(JwtAuthGuard)
  async listSessions(@Req() req: Request): Promise<ListSessionsResponseDto> {
    const payload = req.user as AuthTokenPayload;
    const result = await this.listSessionsUseCase.execute(payload.sub);

    return {
      sessions: result.sessions,
    };
  }

  @Delete('sessions')
  @ApiBearerAuth('accessToken')
  @ApiSecurity('accessToken')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async revokeAllSessions(
    @Req() req: Request,
  ): Promise<{ revokedCount: number; revokedAt: Date }> {
    const payload = req.user as AuthTokenPayload;
    const result = await this.revokeAllSessionsUseCase.execute(payload.sub);

    return {
      revokedCount: result.revokedCount,
      revokedAt: result.revokedAt,
    };
  }

  @Delete('sessions/:id')
  @ApiBearerAuth('accessToken')
  @ApiSecurity('accessToken')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async revokeSession(
    @Req() req: Request,
    @Param('id') sessionId: string,
  ): Promise<{ sessionId: string; revokedAt: Date }> {
    const payload = req.user as AuthTokenPayload;
    const result = await this.revokeSessionUseCase.execute(
      sessionId,
      payload.sub,
    );

    return {
      sessionId: result.sessionId,
      revokedAt: result.revokedAt,
    };
  }

  @Post('refresh')
  @ApiConsumes('application/json')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<object> {
    const refreshToken = req.cookies?.refreshToken as string | undefined;
    const accessToken = req.cookies?.accessToken as string | undefined;

    if (!refreshToken || !accessToken) {
      throw new InvalidOrExpiredRefreshTokenError();
    }

    const result = await this.refreshTokenUseCase.execute(
      refreshToken,
      accessToken,
    );

    // Set new access token and refresh token cookies using sessionService
    this.sessionService.setRotationCookies(
      res,
      result.accessToken,
      result.refreshToken,
    );

    // Return empty body - tokens should not be accessible to JavaScript
    return {};
  }

  @Get('me')
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard, TenantContextGuard)
  async me(@Req() req: Request): Promise<MeResponseDto> {
    const payload = req.user as AuthTokenPayload;
    // tenantId may be undefined for platform-only users (TenantContextGuard passes for platform users with platformRoles)
    const result = await this.meUseCase.execute(payload.sub, payload.tenantId);

    return {
      user: result.user,
      tenant: result.tenant,
      scope: payload.scope,
    };
  }
}
