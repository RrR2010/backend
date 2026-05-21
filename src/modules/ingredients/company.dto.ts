import { ApiProperty } from '@nestjs/swagger'
import { Company } from '@ingredients/company.entity'
import { SystemState } from '@shared/behaviours/lockable'

// TODO: zod validate dto
export class CreateCompanyDto {
  @ApiProperty({ type: String })
  tenantId!: string

  @ApiProperty({ type: String })
  name!: string

  @ApiProperty({ type: String })
  type!: string

  @ApiProperty({ type: String, required: false, nullable: true })
  contactInfo?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  taxId?: string | null
}

export class CreateCompanyResponseDto {
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

  static fromDomain(company: Company): CreateCompanyResponseDto {
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

export class CompanyResponseDto extends CreateCompanyResponseDto {}

export class UpdateCompanyDto {
  @ApiProperty({ type: String, required: false })
  name?: string

  @ApiProperty({ type: String, required: false })
  type?: string

  @ApiProperty({ type: String, required: false, nullable: true })
  contactInfo?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  taxId?: string | null
}
