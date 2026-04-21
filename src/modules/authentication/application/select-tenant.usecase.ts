import { Injectable } from '@nestjs/common';
import { MembershipRepository } from '@modules/memberships/domain/membership.repository';
import {
  UserHasNoMembershipsError,
  UserDoesNotHaveAccessToTenantError,
} from '@modules/authentication/domain/auth.errors';
import { TokenService } from '@modules/authentication/domain/token.service';
import { RefreshTokenService } from '@modules/authentication/domain/refresh-token.service';

@Injectable()
export class SelectTenantUseCase {
  constructor(
    private readonly membershipRepository: MembershipRepository,
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async execute(
    userId: string,
    tenantId: string,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<SelectTenantResult> {
    const memberships = await this.membershipRepository.findByUserId(userId);

    if (!memberships) {
      throw new UserHasNoMembershipsError();
    }

    const membership = memberships.find((m) => m.tenantId === tenantId);
    if (!membership) {
      throw new UserDoesNotHaveAccessToTenantError();
    }

    const accessToken = this.tokenService.sign({
      sub: userId,
      tenantId: tenantId,
    });

    // Generate and save refresh token
    const refreshToken = this.refreshTokenService.generateRefreshToken();
    const refreshTokenResult = await this.refreshTokenService.saveRefreshToken(
      userId,
      refreshToken,
      deviceInfo,
      ipAddress,
    );

    return {
      accessToken,
      refreshToken: refreshTokenResult.token,
      refreshTokenExpiresAt: refreshTokenResult.expiresAt,
    };
  }
}

export type SelectTenantResult = {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
};
