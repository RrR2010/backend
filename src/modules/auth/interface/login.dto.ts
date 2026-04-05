import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Login email', example: 'joaosilva@email.com' })
  email!: string;

  @ApiProperty({ description: 'Login password', example: 'imJoao123*' })
  password!: string;
}
