import {
  Body,
  Controller,
  Post,
  Get,
  Res,
  Req,
  UseGuards,
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
} from '@modules/auth/application/login.usecase';
import { SelectTenantUseCase } from '@modules/auth/application/select-tenant.usecase';
import { MeUseCase } from '@modules/auth/application/me.usecase';
import { SelectTenantDto } from './select-tenant.dto';
import { SelectTenantResponseDto } from './select-tenant-response.dto';
import {
  TokenService,
  AuthTokenPayload,
} from '@modules/auth/domain/token.service';
import { JwtAuthGuard } from '@modules/auth/infra/jwt-auth.guard';
import { TenantContextGuard } from '@modules/auth/infra/tenant-context.guard';
import type { Request, Response } from 'express';
import { InvalidOrExpiredPreAuthTokenError } from '@modules/auth/domain/auth.errors';
import { Membership } from '@modules/memberships/domain/membership.entity';
import { MeResponseDto } from './me-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private loginUseCase: LoginUseCase,
    private selectTenantUseCase: SelectTenantUseCase,
    private meUseCase: MeUseCase,
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
