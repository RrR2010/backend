import { Injectable } from '@nestjs/common';
import { RefreshTokenService } from '@modules/authentication/domain/refresh-token.service';
import { TokenService } from '@modules/authentication/domain/token.service';
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

    // Tenant context is required for token refresh
    if (!accessPayload.tenantId) {
      throw new MissingTenantContextError();
    }

    // Rotate refresh token (invalidates old, creates new)
    const rotationResult =
      await this.refreshTokenService.rotateRefreshToken(refreshToken);

    if (!rotationResult) {
      throw new InvalidOrExpiredRefreshTokenError();
    }

    // Issue new access token with same tenant context
    const newAccessToken = this.tokenService.sign({
      sub: accessPayload.sub,
      tenantId: accessPayload.tenantId,
    });

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
