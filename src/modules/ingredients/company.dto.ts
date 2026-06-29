import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsOptional } from 'class-validator'
import { Company_TE } from '@ingredients/company.entity'
import { SystemState } from '@shared/behaviours/lockable'

// TODO: zod validate dto
export class CreateCompany_TEDto {
  @ApiProperty({ type: String })
  @IsString()
  name!: string

  @ApiProperty({ type: String })
  @IsString()
  type!: string

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  contactInfo?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  taxId?: string | null
}

export class CreateCompany_TE_ResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  tenantId!: string

  @ApiProperty()
  name!: string

  @ApiProperty()
  type!: string

  @ApiProperty({ required: false, nullable: true })
  contactInfo!: string | null

  @ApiProperty({ required: false, nullable: true })
  taxId!: string | null

  @ApiProperty()
  systemState!: SystemState

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(company: Company_TE): CreateCompany_TE_ResponseDto {
    return {
      id: company.id.value,
      tenantId: company.tenantId,
      name: company.name,
      type: company.type,
      contactInfo: company.contactInfo,
      taxId: company.taxId,
      systemState: company.systemState,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt
    }
  }
}

export class Company_TE_ResponseDto extends CreateCompany_TE_ResponseDto {}

export class UpdateCompany_TEDto {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  name?: string

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  type?: string

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  contactInfo?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  taxId?: string | null
}
