import { ApiProperty } from '@nestjs/swagger';
import { User } from '@modules/users/domain/user.entity';

export class UserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: ['ADMIN', 'MEMBER', 'NONE'], isArray: true })
  platformRoles!: string[];

  static fromDomain(user: User): UserResponseDto {
    return {
      id: user.id.value,
      name: user.name,
      email: user.email.value,
      platformRoles: user.platformRoles,
    };
  }
}
