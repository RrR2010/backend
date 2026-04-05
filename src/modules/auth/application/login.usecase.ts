import { Injectable } from '@nestjs/common';
import { UserRepository } from '@modules/users/domain/user.repository';
import { PasswordHasher } from '../domain/password-hasher';
import { MembershipRepository } from '@modules/memberships/domain/membership.repository';
import { TenantRepository } from '@modules/tenants/domain/tenant.repository';
import { UserResponseDto } from '@modules/users/interface/user-response.dto';
import { TenantResponseDto } from '@modules/tenants/interface/tenant-response.dto';
import { LoginResponseDto } from '../interface/login-response.dto';
import { InvalidCredentialsError } from '../domain/auth.errors';
import { JwtService } from '../domain/jwt.service';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly membershipRepository: MembershipRepository,
    private readonly tenantRepository: TenantRepository,
    private readonly jwtService: JwtService,
  ) {}
  async execute(input: {
    email: string;
    password: string;
  }): Promise<LoginResponseDto> {
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

    const preAuthToken = this.jwtService.signPreAuth({
      sub: user.id.value,
      type: 'pre-auth',
    });

    return {
      user: UserResponseDto.fromDomain(user),
      preAuthToken,
      tenants,
    };
  }
}
