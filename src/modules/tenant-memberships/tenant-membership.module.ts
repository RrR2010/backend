import { Module } from '@nestjs/common'

import { TenantMembershipRepository, PrismaTenantMembershipRepository } from '@tenant-memberships/tenant-membership.repository'
import { TenantMembershipService } from '@tenant-memberships/tenant-membership.service'
import { TenantMembershipsController } from '@tenant-memberships/tenant-membership.controller'

@Module({
  imports: [],

  controllers: [TenantMembershipsController],

  providers: [
    TenantMembershipService,
    PrismaTenantMembershipRepository,
    {
      provide: TenantMembershipRepository,
      useExisting: PrismaTenantMembershipRepository
    }
  ],

  exports: [TenantMembershipRepository, TenantMembershipService]
})
export class TenantMembershipModule {}