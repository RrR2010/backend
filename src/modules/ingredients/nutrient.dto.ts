import { ApiProperty } from '@nestjs/swagger'
import { Nutrient } from '@ingredients/nutrient.entity'
import { NutrientUnit, NutrientCategory } from '@prisma/client'
import { SystemState } from '@shared/behaviours/lockable'

// TODO: zod validate dto
export class CreateNutrientDto {
  @ApiProperty({ type: String })
  tenantId!: string

  @ApiProperty({ type: String })
  name!: string

  @ApiProperty({ enum: NutrientUnit })
  unit!: NutrientUnit

  @ApiProperty({ enum: NutrientCategory })
  category!: NutrientCategory

  @ApiProperty({ type: String, required: false, nullable: true })
  subcategory?: string | null

  @ApiProperty({ type: Number, required: false })
  sortOrder?: number

  @ApiProperty({ type: Boolean, required: false })
  isActive?: boolean
}

export class CreateNutrientResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  tenantId!: string

  @ApiProperty()
  name!: string

  @ApiProperty({ enum: NutrientUnit })
  unit!: NutrientUnit

  @ApiProperty({ enum: NutrientCategory })
  category!: NutrientCategory

  @ApiProperty({ required: false, nullable: true })
  subcategory!: string | null

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

  static fromDomain(nutrient: Nutrient): CreateNutrientResponseDto {
    return {
      id: nutrient.id.value,
      tenantId: nutrient.tenantId,
      name: nutrient.name,
      unit: nutrient.unit,
      category: nutrient.category,
      subcategory: nutrient.subcategory,
      sortOrder: nutrient.sortOrder,
      isActive: nutrient.isActive,
      systemState: nutrient.systemState,
      createdAt: nutrient.createdAt,
      updatedAt: nutrient.updatedAt
    }
  }
}

export class NutrientResponseDto extends CreateNutrientResponseDto {}

export class UpdateNutrientDto {
  @ApiProperty({ type: String, required: false })
  name?: string

  @ApiProperty({ enum: NutrientUnit, required: false })
  unit?: NutrientUnit

  @ApiProperty({ enum: NutrientCategory, required: false })
  category?: NutrientCategory

  @ApiProperty({ type: String, required: false, nullable: true })
  subcategory?: string | null

  @ApiProperty({ type: Number, required: false })
  sortOrder?: number

  @ApiProperty({ type: Boolean, required: false })
  isActive?: boolean
}
