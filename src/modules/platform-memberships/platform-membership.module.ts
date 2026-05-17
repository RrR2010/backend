import { Module } from '@nestjs/common'

import {
  PlatformMembershipRepository,
  PrismaPlatformMembershipRepository
} from '@platform-memberships/platform-membership.repository'
import { PlatformMembershipService } from '@platform-memberships/platform-membership.service'
import { PlatformMembershipsController } from '@platform-memberships/platform-membership.controller'

@Module({
  imports: [],

  controllers: [PlatformMembershipsController],

  providers: [
    PlatformMembershipService,
    PrismaPlatformMembershipRepository,
    {
      provide: PlatformMembershipRepository,
      useExisting: PrismaPlatformMembershipRepository
    }
  ],

  exports: [PlatformMembershipRepository, PlatformMembershipService]
})
export class PlatformMembershipModule {}
