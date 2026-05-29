import { Module } from '@nestjs/common'

import {
  MemberProfileRepository,
  PrismaMemberProfileRepository
} from '@member-profiles/member-profile.repository'
import { MemberProfileService } from '@member-profiles/member-profile.service'
import { MemberProfilesController } from '@member-profiles/member-profile.controller'

@Module({
  imports: [],

  controllers: [MemberProfilesController],

  providers: [
    MemberProfileService,
    PrismaMemberProfileRepository,
    {
      provide: MemberProfileRepository,
      useExisting: PrismaMemberProfileRepository
    }
  ],

  exports: [MemberProfileRepository, MemberProfileService]
})
export class MemberProfileModule {}
