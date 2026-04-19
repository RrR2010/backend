import { PlatformRole } from '@core/domain/platform-role.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiPropertyOptional({
    enum: PlatformRole,
    default: PlatformRole.MEMBER,
    example: PlatformRole.MEMBER,
    description:
      'The role of the user on the platform. ADMIN represents an user that have transversal platform permissions - non tenant. MEMBER is the default role and represents a tenant user.',
  })
  platformRole!: PlatformRole;

  @ApiProperty({ example: 'João da Silva', description: 'User full name.' })
  name!: string;

  @ApiProperty({
    example: 'JoaoDaSilva@email.com',
    description:
      'User email. Must be unique per tenant and in a valid name@domain.com format.',
  })
  email!: string;

  @ApiProperty({
    example: 'imJoao123*',
    description:
      'User password. Must be at least 8 characters, contain at least one lowercase letter, one uppercase letter and one number.',
  })
  password!: string;

  @ApiPropertyOptional({
    example: '0001',
    description:
      'Represents the internal company code. Can be a badge number, registration ID or other, for example.',
  })
  code!: string | null;
}
