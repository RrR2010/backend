import { ApiProperty } from '@nestjs/swagger'
import { PlatformMembership } from '@platform-memberships/platform-membership.entity'
import { PlatformRole } from '@users/user.types'

export class CreatePlatformMembershipDto {
  @ApiProperty({ type: String })
  userId!: string

  @ApiProperty({ enum: PlatformRole, isArray: true, default: [PlatformRole.USER] })
  roles!: PlatformRole[]
}

export class CreatePlatformMembershipResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  userId!: string

  @ApiProperty({ enum: PlatformRole, isArray: true })
  roles!: PlatformRole[]

  @ApiProperty()
  systemState!: string

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(membership: PlatformMembership): CreatePlatformMembershipResponseDto {
    return {
      id: membership.id.value,
      userId: membership.userId,
      roles: membership.roles,
      systemState: membership.systemState,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt
    }
  }
}

export class PlatformMembershipResponseDto extends CreatePlatformMembershipResponseDto {}

export class UpdatePlatformMembershipDto {
  @ApiProperty({ enum: PlatformRole, isArray: true, required: false })
  roles?: PlatformRole[]
}