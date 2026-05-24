import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsBoolean, IsUUID, IsEnum, IsNumberString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { Ingredient } from '@ingredients/ingredient.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { AllergenRelationType, IngredientFunctionType } from '@prisma/client'
import { UpdateIngredientRegulatoryProfileDto } from '@ingredients/ingredient-regulatory-profile.dto'
import { UpdateIngredientLabelingProfileDto } from '@ingredients/ingredient-labeling-profile.dto'
import { UpdateIngredientTechnicalProfileDto } from '@ingredients/ingredient-technical-profile.dto'

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

// --- SaveAll composite DTOs ---

export class SaveAllergenAddDto {
  @ApiProperty()
  @IsUUID()
  allergenId!: string

  @ApiProperty({ enum: AllergenRelationType })
  @IsEnum(AllergenRelationType)
  relationType!: AllergenRelationType
}

export class SaveAllergenUpdateDto {
  @ApiProperty()
  @IsUUID()
  id!: string

  @ApiProperty({ enum: AllergenRelationType })
  @IsEnum(AllergenRelationType)
  relationType!: AllergenRelationType
}

export class SaveAllergenDiffDto {
  @ApiProperty({ type: [SaveAllergenAddDto], required: false })
  @ValidateNested({ each: true })
  @Type(() => SaveAllergenAddDto)
  added?: SaveAllergenAddDto[]

  @ApiProperty({ type: [SaveAllergenUpdateDto], required: false })
  @ValidateNested({ each: true })
  @Type(() => SaveAllergenUpdateDto)
  updated?: SaveAllergenUpdateDto[]

  @ApiProperty({ type: [String], required: false })
  removed?: string[]
}

export class SaveNutrientAddDto {
  @ApiProperty()
  @IsUUID()
  nutrientId!: string

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsNumberString()
  value?: string | null
}

export class SaveNutrientUpdateDto {
  @ApiProperty()
  @IsUUID()
  id!: string

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsNumberString()
  value?: string | null
}

export class SaveNutrientDiffDto {
  @ApiProperty({ type: [SaveNutrientAddDto], required: false })
  @ValidateNested({ each: true })
  @Type(() => SaveNutrientAddDto)
  added?: SaveNutrientAddDto[]

  @ApiProperty({ type: [SaveNutrientUpdateDto], required: false })
  @ValidateNested({ each: true })
  @Type(() => SaveNutrientUpdateDto)
  updated?: SaveNutrientUpdateDto[]

  @ApiProperty({ type: [String], required: false })
  removed?: string[]
}

export class SaveAllIngredientDto {
  @ApiProperty({ type: SaveAllergenDiffDto, required: false })
  allergens?: SaveAllergenDiffDto

  @ApiProperty({ type: SaveNutrientDiffDto, required: false })
  nutrients?: SaveNutrientDiffDto

  @ApiProperty({ type: UpdateIngredientRegulatoryProfileDto, required: false })
  regulatoryProfile?: UpdateIngredientRegulatoryProfileDto

  @ApiProperty({ type: UpdateIngredientLabelingProfileDto, required: false })
  labelingProfile?: UpdateIngredientLabelingProfileDto

  @ApiProperty({ type: UpdateIngredientTechnicalProfileDto, required: false })
  technicalProfile?: UpdateIngredientTechnicalProfileDto
}
