import { Injectable } from '@nestjs/common';
import { UserRepository } from '@modules/users/domain/user.repository';
import { TenantRepository } from '@modules/tenants/domain/tenant.repository';
import { UserResponseDto } from '@modules/users/interface/user-response.dto';
import { TenantResponseDto } from '@modules/tenants/interface/tenant-response.dto';

@Injectable()
export class MeUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tenantRepository: TenantRepository,
  ) {}
  async execute(userId: string, tenantId?: string): Promise<MeUseCaseResult> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // If no tenantId, return user data without tenant (platform-only users)
    if (!tenantId) {
      return { user: UserResponseDto.fromDomain(user), tenant: null };
    }

    const tenant = await this.tenantRepository.findById(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    return {
      user: UserResponseDto.fromDomain(user),
      tenant: TenantResponseDto.fromDomain(tenant),
    };
  }
}

export type MeUseCaseResult = {
  user: UserResponseDto;
  tenant: TenantResponseDto | null;
};