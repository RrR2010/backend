import { ApiProperty } from '@nestjs/swagger'
import { BaseNutrient } from '@ingredients/base-nutrient.entity'
import { NutrientUnit, NutrientCategory } from '@prisma/client'
import { SystemState } from '@shared/behaviours/lockable'

export class CreateBaseNutrientDto {
  @ApiProperty({ type: String })
  name!: string

  @ApiProperty({ enum: NutrientUnit })
  unit!: NutrientUnit

  @ApiProperty({ enum: NutrientCategory })
  category!: NutrientCategory

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

  @ApiProperty()
  sortOrder!: number

  @ApiProperty({ enum: SystemState })
  systemState!: SystemState

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
      sortOrder: nutrient.sortOrder,
      systemState: nutrient.systemState,
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

  @ApiProperty({ type: Number, required: false })
  sortOrder?: number
}
