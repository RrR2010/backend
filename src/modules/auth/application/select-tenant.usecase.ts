import { Injectable } from '@nestjs/common';
import { MembershipRepository } from '@modules/memberships/domain/membership.repository';
import {
  UserHasNoMembershipsError,
  UserDoesNotHaveAccessToTenantError,
} from '@modules/auth/domain/auth.errors';
import { TokenService } from '@modules/auth/domain/token.service';

@Injectable()
export class SelectTenantUseCase {
  constructor(
    private readonly membershipRepository: MembershipRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(userId: string, tenantId: string): Promise<SelectTenantResult> {
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

    return { accessToken };
  }
}

export type SelectTenantResult = {
  accessToken: string;
};
