import { ApiProperty } from '@nestjs/swagger'
import { BaseNutrient } from '@ingredients/base-nutrient.entity'
import { NutrientUnit, NutrientCategory } from '@prisma/client'

export class CreateBaseNutrientDto {
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
}

export class CreateBaseNutrientResponseDto {
  @ApiProperty()
  id!: string

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
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(nutrient: BaseNutrient): CreateBaseNutrientResponseDto {
    return {
      id: nutrient.id.value,
      name: nutrient.name,
      unit: nutrient.unit,
      category: nutrient.category,
      subcategory: nutrient.subcategory,
      sortOrder: nutrient.sortOrder,
      createdAt: nutrient.createdAt,
      updatedAt: nutrient.updatedAt
    }
  }
}

export class BaseNutrientResponseDto extends CreateBaseNutrientResponseDto {}

export class UpdateBaseNutrientDto {
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
}
