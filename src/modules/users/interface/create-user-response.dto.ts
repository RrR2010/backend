import { ApiProperty } from '@nestjs/swagger';
import { User } from '@modules/users/domain/user.entity';

export class CreateUserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty({ required: false })
  code!: string | null;

  @ApiProperty()
  createdAt!: Date;

  static fromDomain(user: User): CreateUserResponseDto {
    return {
      id: user.id.value,
      name: user.name,
      email: user.email.value,
      status: user.status,
      code: user.code,
      createdAt: user.createdAt,
    };
  }
}
