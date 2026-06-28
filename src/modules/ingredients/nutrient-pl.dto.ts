import { ApiProperty } from '@nestjs/swagger'
import { Nutrient_PL } from '@ingredients/nutrient-pl.entity'
import { NutrientUnit, NutrientCategory } from '@prisma/client'
import { SystemState } from '@shared/behaviours/lockable'

export class CreateNutrient_PLDto {
  @ApiProperty({ type: String })
  name!: string

  @ApiProperty({ enum: NutrientUnit })
  unit!: NutrientUnit

  @ApiProperty({ enum: NutrientCategory })
  category!: NutrientCategory

  @ApiProperty({ type: String, required: false, nullable: true })
  parentId!: string | null

  @ApiProperty({ type: Number, required: false })
  level?: number

  @ApiProperty({ type: Number, required: false })
  sortOrder?: number

  @ApiProperty({ type: String, required: false, nullable: true })
  regulatoryRef!: string | null
}

export class CreateNutrient_PLResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  name!: string

  @ApiProperty({ enum: NutrientUnit })
  unit!: NutrientUnit

  @ApiProperty({ enum: NutrientCategory })
  category!: NutrientCategory

  @ApiProperty({ required: false, nullable: true })
  parentId!: string | null

  @ApiProperty()
  level!: number

  @ApiProperty()
  sortOrder!: number

  @ApiProperty({ required: false, nullable: true })
  regulatoryRef!: string | null

  @ApiProperty({ enum: SystemState })
  systemState!: SystemState

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  @ApiProperty({ required: false, nullable: true })
  createdBy!: string | null

  @ApiProperty({ required: false, nullable: true })
  updatedBy!: string | null

  static fromDomain(nutrient: Nutrient_PL): CreateNutrient_PLResponseDto {
    return {
      id: nutrient.id.value,
      name: nutrient.name,
      unit: nutrient.unit,
      category: nutrient.category,
      parentId: nutrient.parentId,
      level: nutrient.level,
      sortOrder: nutrient.sortOrder,
      regulatoryRef: nutrient.regulatoryRef,
      systemState: nutrient.systemState,
      createdAt: nutrient.createdAt,
      updatedAt: nutrient.updatedAt,
      createdBy: nutrient.createdBy,
      updatedBy: nutrient.updatedBy
    }
  }
}

export class Nutrient_PLResponseDto extends CreateNutrient_PLResponseDto {}

export class UpdateNutrient_PLDto {
  @ApiProperty({ type: String, required: false })
  name?: string

  @ApiProperty({ enum: NutrientUnit, required: false })
  unit?: NutrientUnit

  @ApiProperty({ enum: NutrientCategory, required: false })
  category?: NutrientCategory

  @ApiProperty({ type: String, required: false, nullable: true })
  parentId!: string | null

  @ApiProperty({ type: Number, required: false })
  level?: number

  @ApiProperty({ type: Number, required: false })
  sortOrder?: number

  @ApiProperty({ type: String, required: false, nullable: true })
  regulatoryRef!: string | null
}
