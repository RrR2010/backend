import { TenantResponseDto } from '@modules/tenants/interface/tenant-response.dto';
import { UserResponseDto } from '@modules/users/interface/user-response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    example: {
      id: '123e4567-e89b-12d3-a456-426655440000',
      name: 'João da Silva',
      email: 'JoaoDaSilva@email.com',
    },
    description: 'The logged in user.',
  })
  user!: UserResponseDto;

  @ApiProperty({
    example: [
      { id: '123e4567-e89b-12d3-a456-426655440000', name: 'My Company Name' },
      {
        id: '123e4567-e89b-12d3-a456-426655440000',
        name: 'Other Company Name',
      },
    ],
    description: 'An array of tenants that user can login.',
  })
  tenants!: TenantResponseDto[];
}
