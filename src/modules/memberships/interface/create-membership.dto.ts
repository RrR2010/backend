import { ApiProperty } from '@nestjs/swagger';

export class CreateMembershipDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426655440000',
    description: 'User ID in UUID format.',
  })
  userId!: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426655440000',
    description: 'Tenant ID in UUID format.',
  })
  tenantId!: string;
}
