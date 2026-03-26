import { ApiProperty } from '@nestjs/swagger';
import { User } from '@modules/users/domain/user.entity';

export class CreateUserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ required: false })
  code!: string | null;

  static fromDomain(user: User): CreateUserResponseDto {
    return {
      id: user.id.value,
      createdAt: user.createdAt,
      name: user.name,
      email: user.email.value,
      code: user.code,
    };
  }
}
