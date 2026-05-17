import { ApiProperty } from '@nestjs/swagger'
import { MemberProfile } from '@member-profiles/member-profile.entity'
import { Gender } from '@shared/enums'

export class CreateMemberProfileDto {
  @ApiProperty({ required: false })
  externalId?: string

  @ApiProperty({ type: String })
  fullName!: string

  @ApiProperty({ required: false })
  displayName?: string

  @ApiProperty({ required: false })
  dateOfBirth?: Date

  @ApiProperty({ enum: Gender, required: false })
  gender?: Gender

  @ApiProperty({ required: false })
  photoUrl?: string

  @ApiProperty({ type: String })
  locale!: string

  @ApiProperty({ type: String })
  timezone!: string

  @ApiProperty({ type: String })
  language!: string

  @ApiProperty({ required: false })
  platformMembershipId?: string

  @ApiProperty({ required: false })
  tenantMembershipId?: string
}

export class CreateMemberProfileResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty({ type: String, nullable: true })
  externalId!: string | null

  @ApiProperty()
  fullName!: string

  @ApiProperty({ type: String, nullable: true })
  displayName!: string | null

  @ApiProperty({ type: Date, nullable: true })
  dateOfBirth!: Date | null

  @ApiProperty({ enum: Gender, nullable: true })
  gender!: Gender | null

  @ApiProperty({ type: String, nullable: true })
  photoUrl!: string | null

  @ApiProperty()
  locale!: string

  @ApiProperty()
  timezone!: string

  @ApiProperty()
  language!: string

  @ApiProperty({ type: String, nullable: true })
  platformMembershipId!: string | null

  @ApiProperty({ type: String, nullable: true })
  tenantMembershipId!: string | null

  @ApiProperty()
  systemState!: string

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(profile: MemberProfile): CreateMemberProfileResponseDto {
    return {
      id: profile.id.value,
      externalId: profile.externalId,
      fullName: profile.fullName,
      displayName: profile.displayName,
      dateOfBirth: profile.dateOfBirth,
      gender: profile.gender,
      photoUrl: profile.photoUrl,
      locale: profile.locale,
      timezone: profile.timezone,
      language: profile.language,
      platformMembershipId: profile.platformMembershipId,
      tenantMembershipId: profile.tenantMembershipId,
      systemState: profile.systemState,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    }
  }
}

export class MemberProfileResponseDto extends CreateMemberProfileResponseDto {}

export class UpdateMemberProfileDto {
  @ApiProperty({ required: false })
  fullName?: string

  @ApiProperty({ required: false })
  displayName?: string

  @ApiProperty({ required: false })
  dateOfBirth?: Date

  @ApiProperty({ enum: Gender, required: false })
  gender?: Gender

  @ApiProperty({ required: false })
  photoUrl?: string

  @ApiProperty({ required: false })
  locale?: string

  @ApiProperty({ required: false })
  timezone?: string

  @ApiProperty({ required: false })
  language?: string

  @ApiProperty({ required: false })
  externalId?: string
}