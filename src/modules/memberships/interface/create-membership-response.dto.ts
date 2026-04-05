import { ApiProperty } from '@nestjs/swagger';
import { Membership } from '@modules/memberships/domain/membership.entity';

export class CreateMembershipResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  tenantId!: string;

  static fromDomain(membership: Membership): CreateMembershipResponseDto {
    return {
      id: membership.id.value,
      createdAt: membership.createdAt,
      userId: membership.userId,
      tenantId: membership.tenantId,
    };
  }
}
