import { Injectable } from '@nestjs/common';
import { Membership } from '@modules/memberships/domain/membership.entity';
import { MembershipRepository } from '@modules/memberships/domain/membership.repository';

@Injectable()
export class CreateMembershipUseCase {
  constructor(private readonly membershipRepository: MembershipRepository) {}

  async execute(input: {
    userId: string;
    tenantId: string;
  }): Promise<Membership> {
    const membership = await this.membershipRepository.save(
      Membership.create({
        userId: input.userId,
        tenantId: input.tenantId,
        tenantRoles: [],
      }),
    );
    return membership;
  }
}
