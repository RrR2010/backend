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
  Headers,
} from '@nestjs/common';
import {
  ApiConsumes,
  ApiSecurity,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LoginDto } from './login.dto';
import {
  LoginResponseResult,
  LoginUseCase,
} from '@modules/authentication/application/login.usecase';
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
import { ListSessionsResponseDto } from './session-response.dto';

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
    private jwtService: TokenService,
  ) {}
  @Post('login')
  @ApiConsumes('application/json')
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() input: LoginDto,
  ): Promise<LoginResponseResult> {
    const result = await this.loginUseCase.execute(input);

    const preAuthToken = this.jwtService.signPreAuth({
      sub: result.user.id,
      type: 'pre-auth',
    });

    res.cookie('preAuthToken', preAuthToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 5 * 60 * 1000,
    });

    return result;
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

    const result = await this.selectTenantUseCase.execute(
      payload.sub,
      input.tenantId,
    );

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 5 * 60 * 1000,
    });

    res.clearCookie('preAuthToken');

    return {};
  }

  @Post('logout')
  @ApiConsumes('application/json')
  logout(@Res({ passthrough: true }) res: Response): void {
    res.clearCookie('preAuthToken');
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
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
  ): Promise<{ accessToken: string }> {
    const refreshToken = req.cookies?.refreshToken as string | undefined;
    const accessToken = req.cookies?.accessToken as string | undefined;

    if (!refreshToken || !accessToken) {
      throw new InvalidOrExpiredRefreshTokenError();
    }

    const result = await this.refreshTokenUseCase.execute(
      refreshToken,
      accessToken,
    );

    // Set new refresh token cookie (HttpOnly, Secure)
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return { accessToken: result.accessToken };
  }

  @Get('me')
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard, TenantContextGuard)
  async me(@Req() req: Request): Promise<MeResponseDto> {
    const payload = req.user as AuthTokenPayload;
    // tenantId is guaranteed to be defined after TenantContextGuard passes
    const result = await this.meUseCase.execute(payload.sub, payload.tenantId!);

    return {
      user: result.user,
      tenant: result.tenant,
    };
  }
}
