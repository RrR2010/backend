import { ApiProperty } from '@nestjs/swagger';
import { User } from '@modules/users/domain/entities/user.entity';

export class CreateUserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  role!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty({ required: false })
  code!: string | null;

  @ApiProperty()
  createdAt!: Date;

  static fromDomain(user: User): CreateUserResponseDto {
    return {
      id: user.id.value,
      tenantId: user.tenantId.value,
      name: user.name,
      email: user.email.value,
      role: user.role,
      status: user.status,
      code: user.code,
      createdAt: user.createdAt,
    };
  }
}
