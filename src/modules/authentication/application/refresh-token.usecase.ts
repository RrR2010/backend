import { Injectable } from '@nestjs/common';
import { RefreshTokenService } from '@modules/authentication/domain/refresh-token.service';
import {
  TokenService,
  AuthScope,
  AuthTokenPayload,
} from '@modules/authentication/domain/token.service';
import {
  InvalidOrExpiredRefreshTokenError,
  InvalidOrExpiredAccessTokenError,
  MissingTenantContextError,
} from '@modules/authentication/domain/auth.errors';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly refreshTokenService: RefreshTokenService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(
    refreshToken: string,
    currentAccessToken: string,
  ): Promise<RefreshTokenResult> {
    // Verify current access token to get tenant context
    const accessPayload = this.tokenService.verify(currentAccessToken);
    if (!accessPayload) {
      throw new InvalidOrExpiredAccessTokenError();
    }

    // TODO: EPIC_005 - Consider adding platform-scoped refresh support
    // For now, platform users can also refresh tokens
    // TODO: EPIC_005 - Currently allows platform users to refresh without tenant
    // Tenant context is required for token refresh (unless platform scope)
    if (accessPayload.scope === AuthScope.Tenant && !accessPayload.tenantId) {
      throw new MissingTenantContextError();
    }

    // Rotate refresh token (invalidates old, creates new)
    const rotationResult =
      await this.refreshTokenService.rotateRefreshToken(refreshToken);

    if (!rotationResult) {
      throw new InvalidOrExpiredRefreshTokenError();
    }

    // Issue new access token with same scope context
    let newAccessToken: string;

    if (accessPayload.scope === AuthScope.Tenant && accessPayload.tenantId) {
      // Tenant-scoped token refresh
      newAccessToken = this.tokenService.sign({
        sub: accessPayload.sub,
        scope: AuthScope.Tenant,
        tenantId: accessPayload.tenantId,
      });
    } else if (accessPayload.scope === AuthScope.Platform && accessPayload.platformRoles) {
      // Platform-scoped token refresh
      newAccessToken = this.tokenService.sign({
        sub: accessPayload.sub,
        scope: AuthScope.Platform,
        platformRoles: accessPayload.platformRoles,
      });
    } else {
      // Fallback (should not happen if validation above is correct)
      throw new InvalidOrExpiredAccessTokenError();
    }

    return {
      accessToken: newAccessToken,
      refreshToken: rotationResult.token,
    };
  }
}

export type RefreshTokenResult = {
  accessToken: string;
  refreshToken: string;
};
