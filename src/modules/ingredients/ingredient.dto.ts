import { ApiProperty } from '@nestjs/swagger'
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
  tenantId!: string

  @ApiProperty({ type: String })
  code!: string

  @ApiProperty({ type: String, required: false, nullable: true })
  externalCode?: string | null

  @ApiProperty({ type: String })
  internalName!: string

  @ApiProperty({ type: String, required: false, nullable: true })
  commercialName?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  saleDenomination?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  functionalGroupId?: string | null

  @ApiProperty({
    enum: IngredientFunctionType,
    enumName: 'IngredientFunctionType'
  })
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

  // === Regulatory Profile ===
  @ApiProperty({ type: Boolean, required: false, default: false })
  hasRtiqPiq?: boolean

  @ApiProperty({ type: String, required: false, nullable: true })
  gmoIngredient?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  gmoDonorSpecies?: string | null

  @ApiProperty({ type: Number, required: false, nullable: true })
  gmoPercentage?: number | null

  @ApiProperty({ type: String, required: false, nullable: true })
  irradiatedIngredient?: string | null

  @ApiProperty({
    enum: FlavorOriginType,
    enumName: 'FlavorOriginType',
    required: false,
    nullable: true
  })
  flavorOriginType?: FlavorOriginType | null

  @ApiProperty({
    enum: ColorantOriginType,
    enumName: 'ColorantOriginType',
    required: false,
    nullable: true
  })
  colorantOriginType?: ColorantOriginType | null

  // === Labeling Profile ===
  @ApiProperty({ type: Boolean, required: false, default: false })
  containsAddedSugars?: boolean

  @ApiProperty({ type: Boolean, required: false, default: false })
  containsIngredientWithAddedSugars?: boolean

  @ApiProperty({ type: Boolean, required: false, default: false })
  containsNaturallyOccurringSugarSubstitutes?: boolean

  @ApiProperty({ type: Boolean, required: false, default: false })
  usesProcessingThatIncreasesSugars?: boolean

  @ApiProperty({ type: Boolean, required: false, default: false })
  containsAddedFatsOrOils?: boolean

  @ApiProperty({ type: Boolean, required: false, default: false })
  containsButterOrMargarine?: boolean

  @ApiProperty({ type: Boolean, required: false, default: false })
  containsDairyCream?: boolean

  @ApiProperty({ type: Boolean, required: false, default: false })
  containsIngredientsWithFatsOrCream?: boolean

  // === Technical Profile ===
  @ApiProperty({ type: Number, required: false, nullable: true })
  pac?: number | null

  @ApiProperty({ type: Number, required: false, nullable: true })
  pod?: number | null

  @ApiProperty({ type: Number, required: false, nullable: true })
  totalSolids?: number | null

  @ApiProperty({ type: Number, required: false, nullable: true })
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

  // === Regulatory Profile ===
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

  // === Labeling Profile ===
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

  // === Technical Profile ===
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

      // Regulatory Profile
      hasRtiqPiq: ingredient.hasRtiqPiq,
      gmoIngredient: ingredient.gmoIngredient,
      gmoDonorSpecies: ingredient.gmoDonorSpecies,
      gmoPercentage: ingredient.gmoPercentage,
      irradiatedIngredient: ingredient.irradiatedIngredient,
      flavorOriginType: ingredient.flavorOriginType,
      colorantOriginType: ingredient.colorantOriginType,

      // Labeling Profile
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

      // Technical Profile
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
  code?: string

  @ApiProperty({ type: String, required: false, nullable: true })
  externalCode?: string | null

  @ApiProperty({ type: String, required: false })
  internalName?: string

  @ApiProperty({ type: String, required: false, nullable: true })
  commercialName?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  saleDenomination?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  functionalGroupId?: string | null

  @ApiProperty({
    enum: IngredientFunctionType,
    enumName: 'IngredientFunctionType',
    required: false
  })
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

  // === Regulatory Profile ===
  @ApiProperty({ type: Boolean, required: false })
  hasRtiqPiq?: boolean

  @ApiProperty({ type: String, required: false, nullable: true })
  gmoIngredient?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  gmoDonorSpecies?: string | null

  @ApiProperty({ type: Number, required: false, nullable: true })
  gmoPercentage?: number | null

  @ApiProperty({ type: String, required: false, nullable: true })
  irradiatedIngredient?: string | null

  @ApiProperty({
    enum: FlavorOriginType,
    enumName: 'FlavorOriginType',
    required: false,
    nullable: true
  })
  flavorOriginType?: FlavorOriginType | null

  @ApiProperty({
    enum: ColorantOriginType,
    enumName: 'ColorantOriginType',
    required: false,
    nullable: true
  })
  colorantOriginType?: ColorantOriginType | null

  // === Labeling Profile ===
  @ApiProperty({ type: Boolean, required: false })
  containsAddedSugars?: boolean

  @ApiProperty({ type: Boolean, required: false })
  containsIngredientWithAddedSugars?: boolean

  @ApiProperty({ type: Boolean, required: false })
  containsNaturallyOccurringSugarSubstitutes?: boolean

  @ApiProperty({ type: Boolean, required: false })
  usesProcessingThatIncreasesSugars?: boolean

  @ApiProperty({ type: Boolean, required: false })
  containsAddedFatsOrOils?: boolean

  @ApiProperty({ type: Boolean, required: false })
  containsButterOrMargarine?: boolean

  @ApiProperty({ type: Boolean, required: false })
  containsDairyCream?: boolean

  @ApiProperty({ type: Boolean, required: false })
  containsIngredientsWithFatsOrCream?: boolean

  // === Technical Profile ===
  @ApiProperty({ type: Number, required: false, nullable: true })
  pac?: number | null

  @ApiProperty({ type: Number, required: false, nullable: true })
  pod?: number | null

  @ApiProperty({ type: Number, required: false, nullable: true })
  totalSolids?: number | null

  @ApiProperty({ type: Number, required: false, nullable: true })
  ashContent?: number | null
}
