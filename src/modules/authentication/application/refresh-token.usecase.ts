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
} from '@modules/authentication/domain/auth.errors';

// TODO: TASK_004_020 - Remove MissingTenantContextError import after confirming no other usage

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

    // TASK_004_020: Scope-aware validation - allow both platform and tenant sessions
    // Note: tenantId/platformRoles are optional per AuthTokenPayload contract
    // If tenant was deleted, we accept stale token and refresh with available context

    // Rotate refresh token (invalidates old, creates new)
    const rotationResult =
      await this.refreshTokenService.rotateRefreshToken(refreshToken);

    if (!rotationResult) {
      throw new InvalidOrExpiredRefreshTokenError();
    }

    // Issue new access token with same scope context
    // TASK_004_020: Handle scope-aware token refresh, including stale tokens
    // Note: Only include optional properties when defined (tsconfig exactOptionalPropertyTypes)
    let newAccessToken: string;

    if (accessPayload.scope === AuthScope.Tenant) {
      // Tenant-scoped token refresh (tenantId may be missing if tenant deleted)
      const payload: AuthTokenPayload = {
        sub: accessPayload.sub,
        scope: AuthScope.Tenant,
      };
      // Only include tenantId if present (stale token handling)
      if (accessPayload.tenantId) {
        payload.tenantId = accessPayload.tenantId;
      }
      newAccessToken = this.tokenService.sign(payload);
    } else if (accessPayload.scope === AuthScope.Platform) {
      // Platform-scoped token refresh (platformRoles may be missing if stale)
      const payload: AuthTokenPayload = {
        sub: accessPayload.sub,
        scope: AuthScope.Platform,
      };
      // Only include platformRoles if present (stale token handling)
      if (accessPayload.platformRoles) {
        payload.platformRoles = accessPayload.platformRoles;
      }
      newAccessToken = this.tokenService.sign(payload);
    } else {
      // Fallback for unknown scope - should not happen
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
