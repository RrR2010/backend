import { Injectable } from '@nestjs/common';
import { JwtService } from '../domain/jwt.service';
import { MembershipRepository } from '@modules/memberships/domain/membership.repository';
import { SelectTenantResponseDto } from '../interface/select-tenant-response.dto';
import {
  InvalidOrExpiredPreAuthTokenError,
  UserHasNoMembershipsError,
  UserDoesNotHaveAccessToTenantError,
} from '@modules/auth/domain/auth.errors';

@Injectable()
export class SelectTenantUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly membershipRepository: MembershipRepository,
  ) {}

  async execute(
    preAuthToken: string,
    tenantId: string,
  ): Promise<SelectTenantResponseDto> {
    const payload = this.jwtService.verifyPreAuth(preAuthToken);
    if (!payload || payload.type !== 'pre-auth') {
      throw new InvalidOrExpiredPreAuthTokenError();
    }

    const userId = payload.sub;
    const memberships = await this.membershipRepository.findByUserId(userId);

    if (!memberships) {
      throw new UserHasNoMembershipsError();
    }

    const membership = memberships.find((m) => m.tenantId === tenantId);
    if (!membership) {
      throw new UserDoesNotHaveAccessToTenantError();
    }

    const accessToken = this.jwtService.sign({
      sub: userId,
      tenantId: tenantId,
      roles: membership.roles,
    });

    return { accessToken };
  }
}
