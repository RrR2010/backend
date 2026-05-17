import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common'
import {
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiTags,
  getSchemaPath
} from '@nestjs/swagger'
import type { Request, Response } from 'express'
import {
  CpfLoginDto,
  EmailLoginDto,
  LoginResponseDto,
  AuthenticatedUserDto
} from '@authentication/authentication.dto'
import { AuthenticationService } from '@authentication/authentication.service'
import { SessionService } from '@authentication/session.service'
import { TokenService } from '@authentication/token.service'
import {
  AuthTokenPayload,
  PreAuthTokenPayload
} from '@authentication/authentication.types'
import { InvalidCredentialsError } from '@authentication/authentication.errors'
import { UserRepository } from '@users/user.repository'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope, PlatformRole, TenantRole } from '@users/user.types'
import { TenantRepository } from '@tenants/tenant.repository'
import { TenantMembershipRepository } from '@tenant-memberships/tenant-membership.repository'
import { PlatformMembershipRepository } from '@platform-memberships/platform-membership.repository'
import { TenantResponseDto } from '@tenants/tenant.dto'
import { UserResponseDto } from '@users/user.dto'
import { Public } from '@shared/decorators/public.decorator'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { User } from '@users/user.entity'

@ApiTags('Authentication')
@Controller('authentication')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly sessionService: SessionService,
    private readonly tokenService: TokenService,
    private readonly userRepository: UserRepository,
    private readonly tenantMembershipRepository: TenantMembershipRepository,
    private readonly platformMembershipRepository: PlatformMembershipRepository,
    private readonly tenantRepository: TenantRepository
  ) {}

  @Get('me')
  @Authorize(Action.Read, User)
  async getCurrentUser(@Req() req: Request): Promise<AuthenticatedUserDto> {
    const accessToken = req.cookies['accessToken'] as string
    if (!accessToken) {
      throw new InvalidCredentialsError()
    }

    const payload = this.tokenService.verify<AuthTokenPayload>(accessToken)
    if (!payload) {
      throw new InvalidCredentialsError()
    }

    const platformCtx: RequestContext = {
      userId: payload.userId,
      scope: UserScope.PLATFORM,
      roles: []
    }
    const user = await this.userRepository.findById(payload.userId, platformCtx)
    if (!user) {
      throw new InvalidCredentialsError()
    }

    let tenantDto: TenantResponseDto | null = null

    if (user.scope === UserScope.TENANT) {
      const tenantMemberships =
        await this.tenantMembershipRepository.findByUserId(payload.userId, platformCtx)

      if (tenantMemberships.length === 0 || !tenantMemberships[0]) {
        throw new InvalidCredentialsError()
      }

      const tenant = await this.tenantRepository.findById(
        tenantMemberships[0].tenantId,
        platformCtx
      )

      if (!tenant) {
        throw new InvalidCredentialsError()
      }

      tenantDto = TenantResponseDto.fromDomain(tenant)
    }

    return {
      user: UserResponseDto.fromDomain(user),
      ...(tenantDto ? { tenant: tenantDto } : {})
    }
  }

  @Public()
  @Post('login')
  @ApiExtraModels(EmailLoginDto, CpfLoginDto)
  @ApiBody({
    schema: {
      anyOf: [
        { $ref: getSchemaPath(EmailLoginDto) },
        { $ref: getSchemaPath(CpfLoginDto) }
      ],
      discriminator: {
        propertyName: 'providerType',
        mapping: {
          EMAIL: getSchemaPath(EmailLoginDto),
          CPF: getSchemaPath(CpfLoginDto)
        }
      }
    }
  })
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: EmailLoginDto | CpfLoginDto
  ): Promise<LoginResponseDto> {
    const device = req.headers['user-agent'] || null
    const ipAddress = req.ip || req.socket?.remoteAddress || null

    const loginResult = await this.authenticationService.login(body)

    await this.sessionService.createSession(
      res,
      loginResult.tokenPayload.userId,
      loginResult.tokenPayload,
      device,
      ipAddress,
      loginResult.nextStepHint === 'direct-login'
        ? loginResult.tenant?.id
        : null
    )

    return {
      user: loginResult.user,
      nextStepHint: loginResult.nextStepHint,
      ...(loginResult.nextStepHint === 'select-tenant'
        ? { tenants: loginResult.tenants }
        : {}),
      ...(loginResult.nextStepHint === 'direct-login' && loginResult.tenant
        ? { tenant: loginResult.tenant }
        : {})
    }
  }

  @Public()
  @ApiConsumes('application/json')
  @Post('select-tenant')
  async selectTenant(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: { tenantId: string }
  ): Promise<AuthenticatedUserDto> {
    const device = req.headers['user-agent']
    const ipAddress = req.ip || req.socket?.remoteAddress || undefined

    const token = req.cookies['preAuthToken'] as string
    const payload = this.tokenService.verify<PreAuthTokenPayload>(token)

    if (!payload) {
      throw new InvalidCredentialsError()
    }

    const loginResult = await this.authenticationService.selectTenant({
      userId: payload.userId,
      tenantId: body.tenantId
    })

    await this.sessionService.createSession(
      res,
      payload.userId,
      loginResult.tokenPayload,
      device || null,
      ipAddress || null
    )

    return {
      user: loginResult.user,
      tenant: loginResult.tenant
    }
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    await this.sessionService.refreshSession(req, res)
  }

  @Public()
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    const accessToken = req.cookies['accessToken'] as string
    let ctx: RequestContext | undefined = undefined
    
    if (accessToken) {
      const payload = this.tokenService.verify<AuthTokenPayload>(accessToken)
      if (payload) {
        if (payload.scope === UserScope.PLATFORM) {
          ctx = {
            userId: payload.userId,
            scope: UserScope.PLATFORM,
            roles: payload.roles as PlatformRole[]
          }
        } else if (payload.scope === UserScope.TENANT && payload.tenantId) {
          ctx = {
            userId: payload.userId,
            scope: UserScope.TENANT,
            tenantId: payload.tenantId,
            roles: payload.roles as TenantRole[]
          }
        }
      }
    }
    
    // Revoke current session in DB
    await this.sessionService.revokeCurrentSession(req, ctx!)
    // Clear cookies
    this.sessionService.clearCookies(res)
  }
}
