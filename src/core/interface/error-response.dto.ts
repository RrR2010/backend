import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 401 })
  statusCode!: number;

  @ApiProperty({ example: 'Invalid Credentials' })
  message!: string;

  @ApiProperty({ example: 'INVALID_CREDENTIALS' })
  code!: string;
}
