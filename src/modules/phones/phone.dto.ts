import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'
import { Phone } from '@phones/phone.entity'
import { OwnerType, PhoneType } from '@shared/enums'

export class CreatePhoneDto {
  @ApiProperty({ type: String })
  ownerId!: string

  @ApiProperty({ enum: OwnerType })
  ownerType!: OwnerType

  @ApiProperty({ enum: PhoneType })
  type!: PhoneType

  @ApiProperty({ type: String })
  countryCode!: string

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  extension?: string | null

  @ApiProperty({ type: String })
  number!: string

  @ApiProperty({ default: false })
  isWhatsapp!: boolean

  @ApiProperty({ default: false })
  isDefault!: boolean
}

export class CreatePhoneResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  ownerId!: string

  @ApiProperty({ enum: OwnerType })
  ownerType!: OwnerType

  @ApiProperty()
  tenantId!: string

  @ApiProperty({ enum: PhoneType })
  type!: PhoneType

  @ApiProperty()
  countryCode!: string

  @ApiProperty({ nullable: true })
  extension!: string | null

  @ApiProperty()
  number!: string

  @ApiProperty()
  isWhatsapp!: boolean

  @ApiProperty()
  isDefault!: boolean

  @ApiProperty()
  systemState!: string

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(phone: Phone): CreatePhoneResponseDto {
    return {
      id: phone.id.value,
      ownerId: phone.ownerId,
      ownerType: phone.ownerType,
      tenantId: phone.tenantId,
      type: phone.type,
      countryCode: phone.countryCode,
      extension: phone.extension,
      number: phone.number,
      isWhatsapp: phone.isWhatsapp,
      isDefault: phone.isDefault,
      systemState: phone.systemState,
      createdAt: phone.createdAt,
      updatedAt: phone.updatedAt
    }
  }
}

export class PhoneResponseDto extends CreatePhoneResponseDto {}

export class UpdatePhoneDto {
  @ApiProperty({ enum: PhoneType, required: false })
  type?: PhoneType

  @ApiProperty({ required: false })
  countryCode?: string

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  extension?: string | null

  @ApiProperty({ required: false })
  number?: string

  @ApiProperty({ required: false })
  isWhatsapp?: boolean

  @ApiProperty({ required: false })
  isDefault?: boolean
}
