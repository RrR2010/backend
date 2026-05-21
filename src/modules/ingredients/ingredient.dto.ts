import { ApiProperty } from '@nestjs/swagger'
import { Ingredient } from '@ingredients/ingredient.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { IngredientFunctionType } from '@prisma/client'

// TODO: zod validate dto
export class CreateIngredientDto {
  @ApiProperty({ type: String })
  tenantId!: string

  @ApiProperty({ type: String })
  code!: string

  @ApiProperty({ type: String })
  functionalName!: string

  @ApiProperty({ type: String, required: false, nullable: true })
  commercialName?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  saleName?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  functionalGroupId?: string | null

  @ApiProperty({ enum: IngredientFunctionType, enumName: 'IngredientFunctionType' })
  ingredientFunction!: IngredientFunctionType

  @ApiProperty({ type: String, required: false, nullable: true })
  notes?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  manufacturerId?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  supplierId?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  technicalSourceId?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  usageIndication?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  ingredientsListDesc?: string | null
}

export class CreateIngredientResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  tenantId!: string

  @ApiProperty()
  code!: string

  @ApiProperty()
  functionalName!: string

  @ApiProperty({ required: false, nullable: true })
  commercialName!: string | null

  @ApiProperty({ required: false, nullable: true })
  saleName!: string | null

  @ApiProperty({ required: false, nullable: true })
  functionalGroupId!: string | null

  @ApiProperty({ enum: IngredientFunctionType, enumName: 'IngredientFunctionType' })
  ingredientFunction!: IngredientFunctionType

  @ApiProperty({ required: false, nullable: true })
  notes!: string | null

  @ApiProperty({ required: false, nullable: true })
  manufacturerId!: string | null

  @ApiProperty({ required: false, nullable: true })
  supplierId!: string | null

  @ApiProperty({ required: false, nullable: true })
  technicalSourceId!: string | null

  @ApiProperty({ required: false, nullable: true })
  usageIndication!: string | null

  @ApiProperty({ required: false, nullable: true })
  ingredientsListDesc!: string | null

  @ApiProperty()
  systemState!: SystemState

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(ingredient: Ingredient): CreateIngredientResponseDto {
    return {
      id: ingredient.id.value,
      tenantId: ingredient.tenantId,
      code: ingredient.code,
      functionalName: ingredient.functionalName,
      commercialName: ingredient.commercialName,
      saleName: ingredient.saleName,
      functionalGroupId: ingredient.functionalGroupId,
      ingredientFunction: ingredient.ingredientFunction,
      notes: ingredient.notes,
      manufacturerId: ingredient.manufacturerId,
      supplierId: ingredient.supplierId,
      technicalSourceId: ingredient.technicalSourceId,
      usageIndication: ingredient.usageIndication,
      ingredientsListDesc: ingredient.ingredientsListDesc,
      systemState: ingredient.systemState,
      createdAt: ingredient.createdAt,
      updatedAt: ingredient.updatedAt
    }
  }
}

export class IngredientResponseDto extends CreateIngredientResponseDto {}

export class UpdateIngredientDto {
  @ApiProperty({ type: String, required: false })
  code?: string

  @ApiProperty({ type: String, required: false })
  functionalName?: string

  @ApiProperty({ type: String, required: false, nullable: true })
  commercialName?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  saleName?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  functionalGroupId?: string | null

  @ApiProperty({ enum: IngredientFunctionType, enumName: 'IngredientFunctionType', required: false })
  ingredientFunction?: IngredientFunctionType

  @ApiProperty({ type: String, required: false, nullable: true })
  notes?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  manufacturerId?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  supplierId?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  technicalSourceId?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  usageIndication?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  ingredientsListDesc?: string | null
}
