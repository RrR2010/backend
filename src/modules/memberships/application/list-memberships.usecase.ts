import { Injectable } from '@nestjs/common';
import { Membership } from '@modules/memberships/domain/membership.entity';
import { MembershipRepository } from '@modules/memberships/domain/membership.repository';
import { TenantContextService } from '@core/infra/tenant-context.service';

@Injectable()
export class ListMembershipUseCase {
  constructor(
    private readonly membershipRepository: MembershipRepository,
    private readonly tenantContextService: TenantContextService,
  ) {}

  async execute(): Promise<Membership[]> {
    const tenantId = this.tenantContextService.getTenantId();
    return this.membershipRepository.findAllByTenant(tenantId);
  }
}