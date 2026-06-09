import { ApiProperty } from '@nestjs/swagger'
import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDateString,
  MinLength
} from 'class-validator'
import {
  TenantSiteType,
  Gender,
  RegistrationState,
  PlanType
} from '@shared/enums'
import { UserResponseDto } from '@users/user.dto'
import { TenantResponseDto } from '@tenants/tenant.dto'
import { User } from '@users/user.entity'
import { Tenant } from '@tenants/tenant.entity'

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

  @ApiProperty({ required: false, example: '123.456.789-00' })
  @IsOptional()
  @IsString()
  cpf?: string

  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail()
  email!: string

  @ApiProperty({ example: 'StrongP@ss123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string

  // NOTE (2026-05-20): planType is already part of the registration DTO.
  // FREE plan users will skip payment and provision immediately.
  // Paid plan users (BASIC/PREMIUM) go through Mercado Pago.
  @ApiProperty({ enum: PlanType, example: 'BASIC' })
  @IsEnum(PlanType)
  planType!: PlanType
}

export class BootstrapRegisterResponseDto {
  @ApiProperty()
  registrationId!: string

  @ApiProperty({ nullable: true })
  paymentUrl!: string | null

  @ApiProperty()
  expiresAt!: Date

  @ApiProperty({ nullable: true })
  subscriptionId!: string | null

  static from(
    registrationId: string,
    paymentUrl: string | null,
    expiresAt: Date,
    subscriptionId: string | null = null
  ): BootstrapRegisterResponseDto {
    const dto = new BootstrapRegisterResponseDto()
    dto.registrationId = registrationId
    dto.paymentUrl = paymentUrl
    dto.expiresAt = expiresAt
    dto.subscriptionId = subscriptionId
    return dto
  }
}

export class BootstrapStatusResponseDto {
  @ApiProperty({ enum: RegistrationState })
  state!: RegistrationState

  static from(state: RegistrationState): BootstrapStatusResponseDto {
    const dto = new BootstrapStatusResponseDto()
    dto.state = state
    return dto
  }
}

export class ClaimSessionDto {
  @ApiProperty()
  @IsString()
  registrationId!: string

  @ApiProperty()
  @IsString()
  handoffToken!: string
}

export class ClaimSessionResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user!: UserResponseDto

  @ApiProperty({ type: TenantResponseDto })
  tenant!: TenantResponseDto

  @ApiProperty({ enum: ['direct-login'] })
  nextStepHint!: 'direct-login'

  static from(user: User, tenant: Tenant): ClaimSessionResponseDto {
    const dto = new ClaimSessionResponseDto()
    dto.user = UserResponseDto.fromDomain(user)
    dto.tenant = TenantResponseDto.fromDomain(tenant)
    dto.nextStepHint = 'direct-login'
    return dto
  }
}
