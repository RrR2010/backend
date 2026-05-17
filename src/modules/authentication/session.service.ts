import { Injectable } from '@nestjs/common'
import { parseMsEnv } from '@shared/helper'
import {
  AuthTokenPayload,
  PlatformTokenPayload,
  RefreshTokenPayload,
  TenantTokenPayload,
  TokenPayload
} from '@authentication/authentication.types'
import { TokenService } from '@authentication/token.service'
import { SessionRepository } from '@authentication/session.repository'
import { Session } from './session.entity'
import { Request, Response } from 'express'
import { SessionNotFoundError } from '@authentication/authentication.errors'
import { UserRepository } from '@users/user.repository'
import { PlatformRole, TenantRole, UserScope } from '@users/user.types'
import { RequestContext } from '@authorization/authorization.types'
import { TenantMembershipRepository } from '@tenant-memberships/tenant-membership.repository'
import crypto from 'crypto'
import { PlatformMembershipRepository } from '@platform-memberships/platform-membership.repository'

@Injectable()
export class SessionService {
  private readonly AUTH_TOKEN_EXP
  private readonly PRE_AUTH_TOKEN_EXP
  private readonly REFRESH_TOKEN_EXP
  private readonly COOKIE_BASE_HEADER = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  } as const

  constructor(
    private readonly tokenService: TokenService,
    private readonly sessionRepository: SessionRepository,
    private readonly userRepository: UserRepository,
    private readonly tenantMembershipRepository: TenantMembershipRepository,
    private readonly platformMembershipRepository: PlatformMembershipRepository
  ) {
    this.AUTH_TOKEN_EXP = parseMsEnv(process.env.AUTH_TOKEN_EXP, '15m')
    this.PRE_AUTH_TOKEN_EXP = parseMsEnv(process.env.PRE_AUTH_TOKEN_EXP, '3m')
    this.REFRESH_TOKEN_EXP = parseMsEnv(process.env.REFRESH_TOKEN_EXP, '7d')
  }

  async createSession(
    res: Response,
    userId: string,
    payload: TokenPayload,
    deviceInfo: string | null,
    ipAddress: string | null,
    tenantId: string | null = null
  ) {
    const expiresIn =
      payload.type === 'auth' ? this.AUTH_TOKEN_EXP : this.PRE_AUTH_TOKEN_EXP
    const token = this.tokenService.sign(payload, expiresIn)

    if (payload.type === 'auth') {
      // Generate session first to get ID
      const tempSession = Session.create({
        userId,
        tenantId: tenantId,
        refreshTokenHash: 'temp', // Placeholder - will be replaced
        deviceInfo: deviceInfo ?? null,
        ipAddress: ipAddress ?? null,
        expiresAt: new Date(Date.now() + this.AUTH_TOKEN_EXP),
        revokedAt: null
      })

      // Generate refresh token as JWT with sessionId
      const refreshPayload: RefreshTokenPayload = {
        type: 'refresh',
        userId,
        sessionId: tempSession.id.value,
        tenantId: tenantId ?? null
      }
      const refreshToken = this.tokenService.signRefreshToken(
        refreshPayload,
        this.REFRESH_TOKEN_EXP
      )
      const hashedRefreshToken = this.hashRefreshToken(refreshToken)

      // Update session with actual hash and save
      tempSession.updateRefreshTokenHash(hashedRefreshToken)
      const platformCtx: RequestContext = {
        userId: tempSession.userId,
        scope: UserScope.PLATFORM,
        roles: []
      }
      const session = await this.sessionRepository.save(tempSession, platformCtx)

      this.setAuthCookie(res, token)
      this.setRefreshCookie(res, refreshToken)
      return { sessionId: session.id.value }
    } else {
      this.setPreAuthCookie(res, token)
      return {}
    }
  }

  async refreshSession(req: Request, res: Response) {
    const refreshToken = req.cookies['refreshToken'] as string
    if (!refreshToken) {
      throw new SessionNotFoundError()
    }

    // First, try to verify as JWT to check expiration
    const tokenPayload = this.tokenService.verifyRefreshToken(refreshToken)
    if (!tokenPayload) {
      throw new SessionNotFoundError()
    }

    // Check if token is a refresh token
    if (tokenPayload.type !== 'refresh') {
      throw new SessionNotFoundError()
    }

    // Note: JWT automatically validates expiration via verifyRefreshToken
    // If token is expired, verifyRefreshToken returns null and we throw SessionNotFoundError

    // Verify session exists in DB and get full session data
    const platformCtx: RequestContext = {
      userId: tokenPayload.userId,
      scope: UserScope.PLATFORM,
      roles: []
    }
    const sessions = await this.sessionRepository.findAll(
      {
        id: tokenPayload.sessionId
      },
      platformCtx
    )

    if (!sessions || sessions.length === 0) {
      throw new SessionNotFoundError()
    }

    const lastSession = sessions[0]!

    // Verify the refresh token hash matches
    const hashedRefreshToken = this.hashRefreshToken(refreshToken)
    if (lastSession.refreshTokenHash !== hashedRefreshToken) {
      throw new SessionNotFoundError()
    }

    // Verify session is not revoked and not expired
    if (lastSession.revokedAt !== null || lastSession.isExpired) {
      throw new SessionNotFoundError()
    }

    // Get user data from DB (NOT from token - security requirement)
    const userCtx: RequestContext = {
      userId: lastSession.userId,
      scope: UserScope.PLATFORM,
      roles: []
    }
    const user = await this.userRepository.findById(lastSession.userId, userCtx)
    if (!user) {
      throw new SessionNotFoundError()
    }

    const scope = user.scope
    let roles: TenantRole[] | PlatformRole[]
    if (scope === UserScope.TENANT) {
      const tenantCtx: RequestContext = {
        userId: lastSession.userId,
        scope: UserScope.TENANT,
        tenantId: lastSession.tenantId!,
        roles: []
      }
      const memberships = await this.tenantMembershipRepository.findAll({
        userId: lastSession.userId,
        tenantId: lastSession.tenantId!
      }, tenantCtx)

      if (memberships.length === 0 || !memberships[0]) {
        throw new SessionNotFoundError()
      }

      const membership = memberships[0]
      roles = membership.roles
    } else {
      const memberships = await this.platformMembershipRepository.findAll({
        userId: lastSession.userId
      }, platformCtx)

      if (memberships.length === 0 || !memberships[0]) {
        throw new SessionNotFoundError()
      }

      const membership = memberships[0]
      roles = membership.roles
    }

    let payload: AuthTokenPayload

    if (user.scope === UserScope.PLATFORM) {
      payload = {
        type: 'auth',
        userId: user.id.value,
        scope: UserScope.PLATFORM,
        roles
      } as PlatformTokenPayload
    } else {
      payload = {
        type: 'auth',
        userId: user.id.value,
        scope: UserScope.TENANT,
        tenantId: lastSession.tenantId!,
        roles
      } as TenantTokenPayload
    }

    // Revoke old session
    lastSession.revoke()
    await this.sessionRepository.save(lastSession, platformCtx)

    // Create new session with data from DB
    const newSession = await this.createSession(
      res,
      lastSession.userId,
      payload,
      lastSession.deviceInfo ?? null,
      lastSession.ipAddress ?? null,
      lastSession.tenantId ?? null
    )

    return newSession
  }

  setAuthCookie(res: Response, token: string) {
    res.cookie('accessToken', token, {
      ...this.COOKIE_BASE_HEADER,
      expires: new Date(Date.now() + this.AUTH_TOKEN_EXP)
    })
  }

  setPreAuthCookie(res: Response, token: string) {
    res.cookie('preAuthToken', token, {
      ...this.COOKIE_BASE_HEADER,
      expires: new Date(Date.now() + this.PRE_AUTH_TOKEN_EXP)
    })
  }

  setRefreshCookie(res: Response, token: string) {
    res.cookie('refreshToken', token, {
      ...this.COOKIE_BASE_HEADER,
      expires: new Date(Date.now() + this.REFRESH_TOKEN_EXP)
    })
  }

  clearCookies(res: Response) {
    res.clearCookie('accessToken')
    res.clearCookie('preAuthToken')
    res.clearCookie('refreshToken')
  }

  async revokeCurrentSession(req: Request, ctx: RequestContext): Promise<void> {
    const refreshToken = req.cookies['refreshToken'] as string
    if (refreshToken) {
      const hashedRefreshToken = this.hashRefreshToken(refreshToken)
      const sessions = await this.sessionRepository.findAll(
        {
          refreshTokenHash: hashedRefreshToken
        },
        ctx
      )

      if (sessions && sessions.length > 0) {
        for (const session of sessions) {
          session.revoke()
          await this.sessionRepository.save(session, ctx)
        }
      }
    }
  }

  private hashRefreshToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex')
  }
}
