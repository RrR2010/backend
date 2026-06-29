import { ApiProperty } from '@nestjs/swagger'
import { IngredientNutrient_TE } from '@ingredients/ingredient-nutrient-te.entity'

// TODO: zod validate dto
export class CreateIngredientNutrient_TEDto {
  @ApiProperty({ type: String, required: false })
  tenantId?: string

  @ApiProperty({ type: String })
  ingredientId!: string

  @ApiProperty({ type: String })
  nutrientId!: string

  @ApiProperty({ type: Number, required: false, nullable: true })
  value?: number | null

  @ApiProperty({ type: String, required: false, nullable: true })
  sourceId?: string | null
}

export class IngredientNutrient_TE_ResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  @ApiProperty()
  tenantId!: string

  @ApiProperty()
  ingredientId!: string

  @ApiProperty()
  nutrientId!: string

  @ApiProperty({ type: Number, nullable: true })
  value!: number | null

  @ApiProperty({ type: String, nullable: true })
  sourceId!: string | null

  static fromDomain(
    entry: IngredientNutrient_TE
  ): IngredientNutrient_TE_ResponseDto {
    return {
      id: entry.id.value,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      tenantId: entry.tenantId,
      ingredientId: entry.ingredientId,
      nutrientId: entry.nutrientId,
      value: entry.value,
      sourceId: entry.sourceId
    }
  }
}
