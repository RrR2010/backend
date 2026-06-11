import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'
import { Address } from '@addresses/address.entity'
import { OwnerType, AddressType } from '@shared/enums'

export class CreateAddressDto {
  @ApiProperty({ type: String })
  ownerId!: string

  @ApiProperty({ enum: OwnerType })
  ownerType!: OwnerType

  @ApiProperty({ enum: AddressType })
  type!: AddressType

  @ApiProperty({ type: String })
  street!: string

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  streetType?: string | null

  @ApiProperty({ type: String })
  number!: string

  @ApiProperty({ required: false })
  complement?: string

  @ApiProperty({ required: false })
  district?: string

  @ApiProperty({ type: String })
  city!: string

  @ApiProperty({ type: String })
  state!: string

  @ApiProperty({ type: String })
  postalCode!: string

  @ApiProperty({ type: String })
  country!: string

  @ApiProperty({ default: false })
  isDefault!: boolean
}

export class CreateAddressResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  ownerId!: string

  @ApiProperty({ enum: OwnerType })
  ownerType!: OwnerType

  @ApiProperty()
  tenantId!: string

  @ApiProperty({ enum: AddressType })
  type!: AddressType

  @ApiProperty()
  street!: string

  @ApiProperty({ nullable: true })
  streetType!: string | null

  @ApiProperty()
  number!: string

  @ApiProperty({ type: String, nullable: true, required: false })
  complement?: string | null

  @ApiProperty({ type: String, nullable: true, required: false })
  district?: string | null

  @ApiProperty()
  city!: string

  @ApiProperty()
  state!: string

  @ApiProperty()
  postalCode!: string

  @ApiProperty()
  country!: string

  @ApiProperty()
  isDefault!: boolean

  @ApiProperty()
  systemState!: string

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(address: Address): CreateAddressResponseDto {
    return {
      id: address.id.value,
      ownerId: address.ownerId,
      ownerType: address.ownerType,
      tenantId: address.tenantId,
      type: address.type,
      street: address.street,
      streetType: address.streetType,
      number: address.number,
      complement: address.complement,
      district: address.district,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
      systemState: address.systemState,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt
    }
  }
}

export class AddressResponseDto extends CreateAddressResponseDto {}

export class UpdateAddressDto {
  @ApiProperty({ required: false })
  street?: string

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  streetType?: string | null

  @ApiProperty({ required: false })
  number?: string

  @ApiProperty({ required: false })
  complement?: string

  @ApiProperty({ required: false })
  district?: string

  @ApiProperty({ required: false })
  city?: string

  @ApiProperty({ required: false })
  state?: string

  @ApiProperty({ required: false })
  postalCode?: string

  @ApiProperty({ required: false })
  country?: string

  @ApiProperty({ enum: AddressType, required: false })
  type?: AddressType

  @ApiProperty({ required: false })
  isDefault?: boolean
}
