import { ApiProperty } from '@nestjs/swagger'
import { User } from '@users/user.entity'
import { UserScope } from '@users/user.types'

export class CreateUserResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  scope!: UserScope

  static fromDomain(user: User): CreateUserResponseDto {
    return {
      id: user.id.value,
      createdAt: user.createdAt,
      scope: user.scope
    }
  }
}

export class CreateUserDto {
  @ApiProperty({
    enum: UserScope,
    example: UserScope.TENANT,
    default: UserScope.TENANT,
    description:
      'User scope: PLATFORM (full system access) or TENANT (restricted to tenant context).'
  })
  scope!: UserScope
}

export class UserResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  @ApiProperty({ enum: UserScope })
  scope!: UserScope

  @ApiProperty({ enum: String })
  systemState!: string

  static fromDomain(user: User): UserResponseDto {
    return {
      id: user.id.value,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      scope: user.scope,
      systemState: user.systemState
    }
  }
}