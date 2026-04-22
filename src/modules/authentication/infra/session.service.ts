import { Injectable } from '@nestjs/common';
import type { Response } from 'express';
import {
  TokenService,
  AuthScope,
  AuthTokenPayload,
} from '@modules/authentication/domain/token.service';
import {
  RefreshTokenService,
  RefreshTokenResult,
} from '@modules/authentication/domain/refresh-token.service';

/**
 * User entity interface for session creation.
 * Kept minimal to avoid tight coupling.
 */
export interface SessionUser {
  id: string;
  platformRoles: string[] | undefined;
}

/**
 * Device information from request.
 */
export interface DeviceInfo {
  deviceInfo?: string;
  ipAddress?: string;
}

/**
 * Session creation result.
 */
export interface SessionResult {
  accessToken: string;
  refreshToken: string;
}

/**
 * Cookie options derived from environment.
 */
interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
}

@Injectable()
export class SessionService {
  // Token expiry times (in milliseconds) - from env with fallbacks
  private readonly ACCESS_TOKEN_EXPIRY_MS = parseInt(
    process.env.ACCESS_TOKEN_EXPIRY_MS || '900000',
    10,
  ); // 15 minutes
  private readonly REFRESH_TOKEN_EXPIRY_MS = parseInt(
    process.env.REFRESH_TOKEN_EXPIRY_MS || '604800000',
    10,
  ); // 7 days
  private readonly REFRESH_TOKEN_EXPIRY_LONG_MS = parseInt(
    process.env.REFRESH_TOKEN_EXPIRY_LONG_MS || '2592000000',
    10,
  ); // 30 days
  private readonly PRE_AUTH_TOKEN_EXPIRY_MS = parseInt(
    process.env.PRE_AUTH_TOKEN_EXPIRY_MS || '300000',
    10,
  ); // 5 minutes

  // Base cookie options
  private readonly COOKIE_OPTIONS_BASE: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  constructor(
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  /**
   * Creates a platform-scoped session.
   * Issues access token with platform scope and refresh token.
   */
  async createPlatformSession(
    res: Response,
    user: SessionUser,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<SessionResult> {
    // Generate access token with platform scope
    const accessToken = this.tokenService.sign({
      sub: user.id,
      scope: AuthScope.Platform,
      platformRoles: user.platformRoles ?? [],
    });

    // Generate and save refresh token
    const refreshTokenResult = await this.saveRefreshToken(
      user.id,
      deviceInfo,
      ipAddress,
    );

    // Set cookies
    this.setAccessTokenCookie(res, accessToken);
    this.setRefreshTokenCookie(res, refreshTokenResult.token);

    return {
      accessToken,
      refreshToken: refreshTokenResult.token,
    };
  }

  /**
   * Creates a pre-auth session for tenant users.
   * Issues temporary pre-auth token while user selects a tenant.
   */
  async createPreAuthSession(
    res: Response,
    user: SessionUser,
  ): Promise<string> {
    // Generate pre-auth token
    const preAuthToken = this.tokenService.signPreAuth({
      sub: user.id,
      type: 'pre-auth',
    });

    // Set pre-auth token cookie
    this.setPreAuthTokenCookie(res, preAuthToken);

    return preAuthToken;
  }

  /**
   * Completes tenant login after tenant selection.
   * Issues access token with tenant scope and refresh token.
   * Clears pre-auth token.
   */
  async completeTenantLogin(
    res: Response,
    user: SessionUser,
    tenantId: string,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<SessionResult> {
    // Generate access token with tenant scope
    const accessToken = this.tokenService.sign({
      sub: user.id,
      scope: AuthScope.Tenant,
      tenantId,
    });

    // Generate and save refresh token
    const refreshTokenResult = await this.saveRefreshToken(
      user.id,
      deviceInfo,
      ipAddress,
    );

    // Set cookies
    this.setAccessTokenCookie(res, accessToken);
    this.setRefreshTokenCookie(res, refreshTokenResult.token);
    this.clearPreAuthTokenCookie(res);

    return {
      accessToken,
      refreshToken: refreshTokenResult.token,
    };
  }

  /**
   * Rotates session tokens.
   * Validates current refresh token and issues new tokens.
   * Uses longer expiry for refresh token (30 days).
   */
  async rotateSession(
    res: Response,
    currentRefreshToken: string,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<SessionResult | null> {
    // Rotate refresh token
    const refreshTokenResult =
      await this.refreshTokenService.rotateRefreshToken(
        currentRefreshToken,
        deviceInfo,
        ipAddress,
      );

    if (!refreshTokenResult) {
      return null;
    }

    // Set new cookies with appropriate expiry
    // Note: accessToken needs to be provided by the caller since we don't have user context
    this.setRefreshTokenCookieLong(res, refreshTokenResult.token);

    return {
      accessToken: '',
      refreshToken: refreshTokenResult.token,
    };
  }

  /**
   * Sets rotation cookies for refreshed tokens.
   * Called by refresh endpoint after use case generates new tokens.
   */
  setRotationCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    this.setAccessTokenCookie(res, accessToken);
    this.setRefreshTokenCookieLong(res, refreshToken);
  }

  /**
   * Sets tokens from use case result.
   * Used when use case already generates tokens (e.g., selectTenant, refresh).
   */
  setTokensFromUseCase(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    this.setAccessTokenCookie(res, accessToken);
    this.setRefreshTokenCookie(res, refreshToken);
  }

  /**
   * Clears all session cookies.
   */
  clearAllSessionCookies(res: Response): void {
    this.clearAccessTokenCookie(res);
    this.clearRefreshTokenCookie(res);
    this.clearPreAuthTokenCookie(res);
  }

  // Private helpers for cookie management

  private async saveRefreshToken(
    userId: string,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<RefreshTokenResult> {
    const refreshToken = this.refreshTokenService.generateRefreshToken();
    return this.refreshTokenService.saveRefreshToken(
      userId,
      refreshToken,
      deviceInfo,
      ipAddress,
    );
  }

  private setAccessTokenCookie(res: Response, token: string): void {
    res.cookie('accessToken', token, {
      ...this.COOKIE_OPTIONS_BASE,
      maxAge: this.ACCESS_TOKEN_EXPIRY_MS,
    });
  }

  private setRefreshTokenCookie(res: Response, token: string): void {
    res.cookie('refreshToken', token, {
      ...this.COOKIE_OPTIONS_BASE,
      maxAge: this.REFRESH_TOKEN_EXPIRY_MS,
    });
  }

  private setRefreshTokenCookieLong(res: Response, token: string): void {
    res.cookie('refreshToken', token, {
      ...this.COOKIE_OPTIONS_BASE,
      maxAge: this.REFRESH_TOKEN_EXPIRY_LONG_MS,
    });
  }

  private setPreAuthTokenCookie(res: Response, token: string): void {
    res.cookie('preAuthToken', token, {
      ...this.COOKIE_OPTIONS_BASE,
      maxAge: this.PRE_AUTH_TOKEN_EXPIRY_MS,
    });
  }

  private clearAccessTokenCookie(res: Response): void {
    res.clearCookie('accessToken');
  }

  private clearRefreshTokenCookie(res: Response): void {
    res.clearCookie('refreshToken');
  }

  private clearPreAuthTokenCookie(res: Response): void {
    res.clearCookie('preAuthToken');
  }
}
