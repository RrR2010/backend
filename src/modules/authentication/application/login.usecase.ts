import { Injectable } from '@nestjs/common';
import { UserRepository } from '@modules/users/domain/user.repository';
import { PasswordHasher } from '@modules/authentication/domain/password-hasher';
import { MembershipRepository } from '@modules/memberships/domain/membership.repository';
import { TenantRepository } from '@modules/tenants/domain/tenant.repository';
import { RefreshTokenService } from '@modules/authentication/domain/refresh-token.service';
import { UserResponseDto } from '@modules/users/interface/user-response.dto';
import { TenantResponseDto } from '@modules/tenants/interface/tenant-response.dto';
import { InvalidCredentialsError } from '@modules/authentication/domain/auth.errors';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly membershipRepository: MembershipRepository,
    private readonly tenantRepository: TenantRepository,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}
  async execute(input: {
    email: string;
    password: string;
    deviceInfo?: string;
    ipAddress?: string;
  }): Promise<LoginResponseResult> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) throw new InvalidCredentialsError();
    const isValidPassword = await this.passwordHasher.compare(
      input.password,
      user.passwordHash,
    );
    if (!isValidPassword) throw new InvalidCredentialsError();

    const memberships = await this.membershipRepository.findByUserId(
      user.id.value,
    );
    if (!memberships || memberships.length === 0)
      throw new Error('Invalid credentials');

    const tenants = [];
    for (const membership of memberships) {
      const tenant = await this.tenantRepository.findById(membership.tenantId);
      if (!tenant) continue;
      tenants.push(TenantResponseDto.fromDomain(tenant));
    }

    // Generate and save refresh token
    const refreshToken = this.refreshTokenService.generateRefreshToken();
    const refreshTokenResult = await this.refreshTokenService.saveRefreshToken(
      user.id.value,
      refreshToken,
      input.deviceInfo,
      input.ipAddress,
    );

    return {
      user: UserResponseDto.fromDomain(user),
      tenants,
      refreshToken: refreshTokenResult.token,
      refreshTokenExpiresAt: refreshTokenResult.expiresAt,
    };
  }
}

export type LoginResponseResult = {
  user: UserResponseDto;
  tenants: TenantResponseDto[];
  refreshToken: string;
  refreshTokenExpiresAt: Date;
};
