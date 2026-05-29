import { ApiProperty } from '@nestjs/swagger'
import { TenantAllergen } from '@ingredients/tenant-allergen.entity'
import { SystemState } from '@shared/behaviours/lockable'

// TODO: zod validate dto
export class CreateTenantAllergenDto {
  @ApiProperty({ type: String })
  tenantId!: string

  @ApiProperty({ type: String })
  name!: string

  @ApiProperty({ type: String, required: false, nullable: true })
  category?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  regulatoryRef?: string | null

  @ApiProperty({ type: Number, required: false })
  sortOrder?: number

  @ApiProperty({ type: Boolean, required: false })
  isActive?: boolean
}

export class CreateTenantAllergenResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  tenantId!: string

  @ApiProperty()
  name!: string

  @ApiProperty({ required: false, nullable: true })
  category!: string | null

  @ApiProperty({ required: false, nullable: true })
  regulatoryRef!: string | null

  @ApiProperty()
  sortOrder!: number

  @ApiProperty()
  isActive!: boolean

  @ApiProperty()
  systemState!: SystemState

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(allergen: TenantAllergen): CreateTenantAllergenResponseDto {
    return {
      id: allergen.id.value,
      tenantId: allergen.tenantId,
      name: allergen.name,
      category: allergen.category,
      regulatoryRef: allergen.regulatoryRef,
      sortOrder: allergen.sortOrder,
      isActive: allergen.isActive,
      systemState: allergen.systemState,
      createdAt: allergen.createdAt,
      updatedAt: allergen.updatedAt
    }
  }
}

export class TenantAllergenResponseDto extends CreateTenantAllergenResponseDto {}

export class UpdateTenantAllergenDto {
  @ApiProperty({ type: String, required: false })
  name?: string

  @ApiProperty({ type: String, required: false, nullable: true })
  category?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  regulatoryRef?: string | null

  @ApiProperty({ type: Number, required: false })
  sortOrder?: number

  @ApiProperty({ type: Boolean, required: false })
  isActive?: boolean
}
