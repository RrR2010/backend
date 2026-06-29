import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsOptional, IsUUID, IsNumber, IsBoolean, IsEnum } from 'class-validator'
import { Ingredient_TE } from '@ingredients/ingredient.entity'
import { SystemState } from '@shared/behaviours/lockable'
import {
  IngredientFunctionType,
  FlavorOriginType,
  ColorantOriginType
} from '@prisma/client'

// TODO: zod validate dto
export class CreateIngredient_TEDto {
  @ApiProperty({ type: String })
  @IsString()
  code!: string

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  externalCode?: string | null

  @ApiProperty({ type: String })
  @IsString()
  internalName!: string

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  commercialName?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  saleDenomination?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsUUID()
  @IsString()
  @IsOptional()
  functionalGroupId?: string | null

  @ApiProperty({
    enum: IngredientFunctionType,
    enumName: 'IngredientFunctionType'
  })
  @IsEnum(IngredientFunctionType)
  ingredientFunction!: IngredientFunctionType

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  notes?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsUUID()
  @IsString()
  @IsOptional()
  manufacturerId?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsUUID()
  @IsString()
  @IsOptional()
  supplierId?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsUUID()
  @IsString()
  @IsOptional()
  technicalSourceId?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  usageIndication?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  ingredientsListDesc?: string | null

  @ApiProperty({ type: Boolean, required: false, default: false })
  @IsBoolean()
  @IsOptional()
  hasRtiqPiq?: boolean

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  gmoIngredient?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  gmoDonorSpecies?: string | null

  @ApiProperty({ type: Number, required: false, nullable: true })
  @IsNumber()
  @IsOptional()
  gmoPercentage?: number | null

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  irradiatedIngredient?: string | null

  @ApiProperty({
    enum: FlavorOriginType,
    enumName: 'FlavorOriginType',
    required: false,
    nullable: true
  })
  @IsEnum(FlavorOriginType)
  @IsOptional()
  flavorOriginType?: FlavorOriginType | null

  @ApiProperty({
    enum: ColorantOriginType,
    enumName: 'ColorantOriginType',
    required: false,
    nullable: true
  })
  @IsEnum(ColorantOriginType)
  @IsOptional()
  colorantOriginType?: ColorantOriginType | null

  @ApiProperty({ type: Boolean, required: false, default: false })
  @IsBoolean()
  @IsOptional()
  containsAddedSugars?: boolean

  @ApiProperty({ type: Boolean, required: false, default: false })
  @IsBoolean()
  @IsOptional()
  containsIngredientWithAddedSugars?: boolean

  @ApiProperty({ type: Boolean, required: false, default: false })
  @IsBoolean()
  @IsOptional()
  containsNaturallyOccurringSugarSubstitutes?: boolean

  @ApiProperty({ type: Boolean, required: false, default: false })
  @IsBoolean()
  @IsOptional()
  usesProcessingThatIncreasesSugars?: boolean

  @ApiProperty({ type: Boolean, required: false, default: false })
  @IsBoolean()
  @IsOptional()
  containsAddedFatsOrOils?: boolean

  @ApiProperty({ type: Boolean, required: false, default: false })
  @IsBoolean()
  @IsOptional()
  containsButterOrMargarine?: boolean

  @ApiProperty({ type: Boolean, required: false, default: false })
  @IsBoolean()
  @IsOptional()
  containsDairyCream?: boolean

  @ApiProperty({ type: Boolean, required: false, default: false })
  @IsBoolean()
  @IsOptional()
  containsIngredientsWithFatsOrCream?: boolean

  @ApiProperty({ type: Number, required: false, nullable: true })
  @IsNumber()
  @IsOptional()
  pac?: number | null

  @ApiProperty({ type: Number, required: false, nullable: true })
  @IsNumber()
  @IsOptional()
  pod?: number | null

  @ApiProperty({ type: Number, required: false, nullable: true })
  @IsNumber()
  @IsOptional()
  totalSolids?: number | null

  @ApiProperty({ type: Number, required: false, nullable: true })
  @IsNumber()
  @IsOptional()
  ashContent?: number | null
}

export class CreateIngredientResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  tenantId!: string

  @ApiProperty()
  code!: string

  @ApiProperty({ required: false, nullable: true })
  externalCode!: string | null

  @ApiProperty()
  internalName!: string

  @ApiProperty({ required: false, nullable: true })
  commercialName!: string | null

  @ApiProperty({ required: false, nullable: true })
  saleDenomination!: string | null

  @ApiProperty({ required: false, nullable: true })
  functionalGroupId!: string | null

  @ApiProperty({
    enum: IngredientFunctionType,
    enumName: 'IngredientFunctionType'
  })
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
  hasRtiqPiq!: boolean

  @ApiProperty({ required: false, nullable: true })
  gmoIngredient!: string | null

  @ApiProperty({ required: false, nullable: true })
  gmoDonorSpecies!: string | null

  @ApiProperty({ required: false, nullable: true })
  gmoPercentage!: number | null

  @ApiProperty({ required: false, nullable: true })
  irradiatedIngredient!: string | null

  @ApiProperty({
    enum: FlavorOriginType,
    enumName: 'FlavorOriginType',
    required: false,
    nullable: true
  })
  flavorOriginType!: FlavorOriginType | null

  @ApiProperty({
    enum: ColorantOriginType,
    enumName: 'ColorantOriginType',
    required: false,
    nullable: true
  })
  colorantOriginType!: ColorantOriginType | null

  @ApiProperty()
  containsAddedSugars!: boolean

  @ApiProperty()
  containsIngredientWithAddedSugars!: boolean

  @ApiProperty()
  containsNaturallyOccurringSugarSubstitutes!: boolean

  @ApiProperty()
  usesProcessingThatIncreasesSugars!: boolean

  @ApiProperty()
  containsAddedFatsOrOils!: boolean

  @ApiProperty()
  containsButterOrMargarine!: boolean

  @ApiProperty()
  containsDairyCream!: boolean

  @ApiProperty()
  containsIngredientsWithFatsOrCream!: boolean

  @ApiProperty({ required: false, nullable: true })
  pac!: number | null

  @ApiProperty({ required: false, nullable: true })
  pod!: number | null

  @ApiProperty({ required: false, nullable: true })
  totalSolids!: number | null

  @ApiProperty({ required: false, nullable: true })
  ashContent!: number | null

  @ApiProperty()
  systemState!: SystemState

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(ingredient: Ingredient_TE): CreateIngredientResponseDto {
    return {
      id: ingredient.id.value,
      tenantId: ingredient.tenantId,
      code: ingredient.code,
      externalCode: ingredient.externalCode,
      internalName: ingredient.internalName,
      commercialName: ingredient.commercialName,
      saleDenomination: ingredient.saleDenomination,
      functionalGroupId: ingredient.functionalGroupId,
      ingredientFunction: ingredient.ingredientFunction,
      notes: ingredient.notes,
      manufacturerId: ingredient.manufacturerId,
      supplierId: ingredient.supplierId,
      technicalSourceId: ingredient.technicalSourceId,
      usageIndication: ingredient.usageIndication,
      ingredientsListDesc: ingredient.ingredientsListDesc,
      hasRtiqPiq: ingredient.hasRtiqPiq,
      gmoIngredient: ingredient.gmoIngredient,
      gmoDonorSpecies: ingredient.gmoDonorSpecies,
      gmoPercentage: ingredient.gmoPercentage,
      irradiatedIngredient: ingredient.irradiatedIngredient,
      flavorOriginType: ingredient.flavorOriginType,
      colorantOriginType: ingredient.colorantOriginType,
      containsAddedSugars: ingredient.containsAddedSugars,
      containsIngredientWithAddedSugars:
        ingredient.containsIngredientWithAddedSugars,
      containsNaturallyOccurringSugarSubstitutes:
        ingredient.containsNaturallyOccurringSugarSubstitutes,
      usesProcessingThatIncreasesSugars:
        ingredient.usesProcessingThatIncreasesSugars,
      containsAddedFatsOrOils: ingredient.containsAddedFatsOrOils,
      containsButterOrMargarine: ingredient.containsButterOrMargarine,
      containsDairyCream: ingredient.containsDairyCream,
      containsIngredientsWithFatsOrCream:
        ingredient.containsIngredientsWithFatsOrCream,
      pac: ingredient.pac,
      pod: ingredient.pod,
      totalSolids: ingredient.totalSolids,
      ashContent: ingredient.ashContent,
      systemState: ingredient.systemState,
      createdAt: ingredient.createdAt,
      updatedAt: ingredient.updatedAt
    }
  }
}

export class Ingredient_TE_ResponseDto extends CreateIngredientResponseDto {}

export class UpdateIngredient_TEDto {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  code?: string

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  externalCode?: string | null

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  internalName?: string

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  commercialName?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  saleDenomination?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsUUID()
  @IsString()
  @IsOptional()
  functionalGroupId?: string | null

  @ApiProperty({
    enum: IngredientFunctionType,
    enumName: 'IngredientFunctionType',
    required: false
  })
  @IsEnum(IngredientFunctionType)
  @IsOptional()
  ingredientFunction?: IngredientFunctionType

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  notes?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsUUID()
  @IsString()
  @IsOptional()
  manufacturerId?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsUUID()
  @IsString()
  @IsOptional()
  supplierId?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsUUID()
  @IsString()
  @IsOptional()
  technicalSourceId?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  usageIndication?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  ingredientsListDesc?: string | null

  @ApiProperty({ type: Boolean, required: false })
  @IsBoolean()
  @IsOptional()
  hasRtiqPiq?: boolean

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  gmoIngredient?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  gmoDonorSpecies?: string | null

  @ApiProperty({ type: Number, required: false, nullable: true })
  @IsNumber()
  @IsOptional()
  gmoPercentage?: number | null

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  irradiatedIngredient?: string | null

  @ApiProperty({
    enum: FlavorOriginType,
    enumName: 'FlavorOriginType',
    required: false,
    nullable: true
  })
  @IsEnum(FlavorOriginType)
  @IsOptional()
  flavorOriginType?: FlavorOriginType | null

  @ApiProperty({
    enum: ColorantOriginType,
    enumName: 'ColorantOriginType',
    required: false,
    nullable: true
  })
  @IsEnum(ColorantOriginType)
  @IsOptional()
  colorantOriginType?: ColorantOriginType | null

  @ApiProperty({ type: Boolean, required: false })
  @IsBoolean()
  @IsOptional()
  containsAddedSugars?: boolean

  @ApiProperty({ type: Boolean, required: false })
  @IsBoolean()
  @IsOptional()
  containsIngredientWithAddedSugars?: boolean

  @ApiProperty({ type: Boolean, required: false })
  @IsBoolean()
  @IsOptional()
  containsNaturallyOccurringSugarSubstitutes?: boolean

  @ApiProperty({ type: Boolean, required: false })
  @IsBoolean()
  @IsOptional()
  usesProcessingThatIncreasesSugars?: boolean

  @ApiProperty({ type: Boolean, required: false })
  @IsBoolean()
  @IsOptional()
  containsAddedFatsOrOils?: boolean

  @ApiProperty({ type: Boolean, required: false })
  @IsBoolean()
  @IsOptional()
  containsButterOrMargarine?: boolean

  @ApiProperty({ type: Boolean, required: false })
  @IsBoolean()
  @IsOptional()
  containsDairyCream?: boolean

  @ApiProperty({ type: Boolean, required: false })
  @IsBoolean()
  @IsOptional()
  containsIngredientsWithFatsOrCream?: boolean

  @ApiProperty({ type: Number, required: false, nullable: true })
  @IsNumber()
  @IsOptional()
  pac?: number | null

  @ApiProperty({ type: Number, required: false, nullable: true })
  @IsNumber()
  @IsOptional()
  pod?: number | null

  @ApiProperty({ type: Number, required: false, nullable: true })
  @IsNumber()
  @IsOptional()
  totalSolids?: number | null

  @ApiProperty({ type: Number, required: false, nullable: true })
  @IsNumber()
  @IsOptional()
  ashContent?: number | null
}
