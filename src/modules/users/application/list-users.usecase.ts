import { Injectable } from '@nestjs/common';
import { TenantContextService } from '@core/infra/tenant-context.service';
import { UserRepository } from '@modules/users/domain/user.repository';

@Injectable()
export class ListUsersUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tenantContextService: TenantContextService,
  ) {}

  async execute(): Promise<import('@modules/users/domain/user.entity').User[]> {
    const tenantId = this.tenantContextService.getTenantId();
    return this.userRepository.findAllByTenant(tenantId);
  }
}