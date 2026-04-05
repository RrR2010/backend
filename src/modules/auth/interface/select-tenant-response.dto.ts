import { ApiProperty } from '@nestjs/swagger';

export class SelectTenantResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'The final JWT access token with tenant information.',
  })
  accessToken!: string;
}
