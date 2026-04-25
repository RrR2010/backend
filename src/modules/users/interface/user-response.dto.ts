import { ApiProperty } from '@nestjs/swagger';
import { User } from '@modules/users/domain/user.entity';
import { PlatformRole } from '@core/domain/authorization';

export class UserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: PlatformRole, isArray: true })
  platformRoles!: PlatformRole[];

  static fromDomain(user: User): UserResponseDto {
    return {
      id: user.id.value,
      name: user.name,
      email: user.email.value,
      platformRoles: user.platformRoles,
    };
  }
}
