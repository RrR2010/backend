import { ApiProperty } from '@nestjs/swagger'
import { TenantMembership } from '@tenant-memberships/tenant-membership.entity'
import { TenantRole } from '@users/user.types'

export class CreateTenantMembershipDto {
  @ApiProperty({ type: String })
  userId!: string

  @ApiProperty({ type: String })
  tenantId!: string

  @ApiProperty({ default: false })
  isOwner!: boolean

  @ApiProperty({ enum: TenantRole, isArray: true, default: [TenantRole.USER] })
  roles!: TenantRole[]
}

export class CreateTenantMembershipResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  userId!: string

  @ApiProperty()
  tenantId!: string

  @ApiProperty()
  isOwner!: boolean

  @ApiProperty({ enum: TenantRole, isArray: true })
  roles!: TenantRole[]

  @ApiProperty()
  systemState!: string

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(membership: TenantMembership): CreateTenantMembershipResponseDto {
    return {
      id: membership.id.value,
      userId: membership.userId,
      tenantId: membership.tenantId,
      isOwner: membership.isOwner,
      roles: membership.roles,
      systemState: membership.systemState,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt
    }
  }
}

export class TenantMembershipResponseDto extends CreateTenantMembershipResponseDto {}

export class UpdateTenantMembershipDto {
  @ApiProperty({ enum: TenantRole, isArray: true, required: false })
  roles?: TenantRole[]

  @ApiProperty({ required: false })
  isOwner?: boolean
}