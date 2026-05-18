import { ApiProperty } from '@nestjs/swagger'
import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDateString,
  MinLength
} from 'class-validator'
import { TenantSiteType, Gender } from '@shared/enums'

export class BootstrapRegisterDto {
  @ApiProperty({ example: 'Sorveteria Gelada' })
  @IsString()
  tenantName!: string

  @ApiProperty({ required: false, example: 'pt-BR' })
  @IsOptional()
  @IsString()
  tenantLocale?: string

  @ApiProperty({ required: false, example: 'America/Sao_Paulo' })
  @IsOptional()
  @IsString()
  tenantTimezone?: string

  @ApiProperty({ required: false, example: 'pt' })
  @IsOptional()
  @IsString()
  tenantLanguage?: string

  @ApiProperty({ example: 'Loja Centro' })
  @IsString()
  tenantSiteName!: string

  @ApiProperty({ example: 'Sorveteria Gelada LTDA' })
  @IsString()
  tenantSiteLegalName!: string

  @ApiProperty({ example: '12.345.678/0001-90' })
  @IsString()
  tenantSiteTaxId!: string

  @ApiProperty({ required: false, enum: TenantSiteType, example: 'FACTORY' })
  @IsOptional()
  @IsEnum(TenantSiteType)
  tenantSiteType?: TenantSiteType

  @ApiProperty({ example: 'Joao da Silva' })
  @IsString()
  fullName!: string

  @ApiProperty({ required: false, example: 'Joao' })
  @IsOptional()
  @IsString()
  displayName?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string

  @ApiProperty({ required: false, enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender

  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail()
  email!: string

  @ApiProperty({ example: 'StrongP@ss123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string
}

export class BootstrapRegisterResponseDto {
  @ApiProperty()
  registrationId!: string

  @ApiProperty()
  paymentUrl!: string

  @ApiProperty()
  expiresAt!: Date

  static from(
    registrationId: string,
    paymentUrl: string,
    expiresAt: Date
  ): BootstrapRegisterResponseDto {
    const dto = new BootstrapRegisterResponseDto()
    dto.registrationId = registrationId
    dto.paymentUrl = paymentUrl
    dto.expiresAt = expiresAt
    return dto
  }
}
