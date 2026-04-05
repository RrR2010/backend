import { Injectable } from '@nestjs/common';
import { Membership } from '@modules/memberships/domain/membership.entity';
import { MembershipRepository } from '@modules/memberships/domain/membership.repository';

@Injectable()
export class ListMembershipUseCase {
  constructor(private readonly membershipRepository: MembershipRepository) {}

  async execute(): Promise<Membership[]> {
    return this.membershipRepository.findAll();
  }
}
