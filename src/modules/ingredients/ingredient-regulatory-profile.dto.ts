import { ApiProperty } from '@nestjs/swagger'
import { IngredientRegulatoryProfile } from '@ingredients/ingredient-regulatory-profile.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { FlavorOriginType, ColorantOriginType } from '@prisma/client'

// TODO: zod validate dto
export class CreateIngredientRegulatoryProfileDto {
  @ApiProperty({ type: String })
  tenantId!: string

  @ApiProperty({ type: String })
  ingredientId!: string

  @ApiProperty({ type: Boolean, required: false, default: false })
  hasRtiq?: boolean

  @ApiProperty({ type: Boolean, required: false, default: false })
  isGmo?: boolean

  @ApiProperty({ type: String, required: false, nullable: true })
  gmoIngredient?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  gmoDonorSpecies?: string | null

  @ApiProperty({ type: Number, required: false, nullable: true })
  gmoPercentage?: number | null

  @ApiProperty({ type: Boolean, required: false, default: false })
  isIrradiated?: boolean

  @ApiProperty({ type: String, required: false, nullable: true })
  irradiatedIngredient?: string | null

  @ApiProperty({ type: Boolean, required: false, default: false })
  containsLactose?: boolean

  @ApiProperty({ type: Boolean, required: false, default: false })
  containsGluten?: boolean

  @ApiProperty({ type: Boolean, required: false, default: false })
  containsAspartame?: boolean

  @ApiProperty({ enum: FlavorOriginType, enumName: 'FlavorOriginType', required: false, nullable: true })
  flavorOriginType?: FlavorOriginType | null

  @ApiProperty({ enum: ColorantOriginType, enumName: 'ColorantOriginType', required: false, nullable: true })
  colorantOriginType?: ColorantOriginType | null
}

export class CreateIngredientRegulatoryProfileResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  tenantId!: string

  @ApiProperty()
  ingredientId!: string

  @ApiProperty()
  hasRtiq!: boolean

  @ApiProperty()
  isGmo!: boolean

  @ApiProperty({ required: false, nullable: true })
  gmoIngredient!: string | null

  @ApiProperty({ required: false, nullable: true })
  gmoDonorSpecies!: string | null

  @ApiProperty({ required: false, nullable: true })
  gmoPercentage!: number | null

  @ApiProperty()
  isIrradiated!: boolean

  @ApiProperty({ required: false, nullable: true })
  irradiatedIngredient!: string | null

  @ApiProperty()
  containsLactose!: boolean

  @ApiProperty()
  containsGluten!: boolean

  @ApiProperty()
  containsAspartame!: boolean

  @ApiProperty({ enum: FlavorOriginType, enumName: 'FlavorOriginType', required: false, nullable: true })
  flavorOriginType!: FlavorOriginType | null

  @ApiProperty({ enum: ColorantOriginType, enumName: 'ColorantOriginType', required: false, nullable: true })
  colorantOriginType!: ColorantOriginType | null

  @ApiProperty()
  systemState!: SystemState

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(profile: IngredientRegulatoryProfile): CreateIngredientRegulatoryProfileResponseDto {
    return {
      id: profile.id.value,
      tenantId: profile.tenantId,
      ingredientId: profile.ingredientId,
      hasRtiq: profile.hasRtiq,
      isGmo: profile.isGmo,
      gmoIngredient: profile.gmoIngredient,
      gmoDonorSpecies: profile.gmoDonorSpecies,
      gmoPercentage: profile.gmoPercentage,
      isIrradiated: profile.isIrradiated,
      irradiatedIngredient: profile.irradiatedIngredient,
      containsLactose: profile.containsLactose,
      containsGluten: profile.containsGluten,
      containsAspartame: profile.containsAspartame,
      flavorOriginType: profile.flavorOriginType,
      colorantOriginType: profile.colorantOriginType,
      systemState: profile.systemState,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    }
  }
}

export class IngredientRegulatoryProfileResponseDto extends CreateIngredientRegulatoryProfileResponseDto {}

export class UpdateIngredientRegulatoryProfileDto {
  @ApiProperty({ type: Boolean, required: false })
  hasRtiq?: boolean

  @ApiProperty({ type: Boolean, required: false })
  isGmo?: boolean

  @ApiProperty({ type: String, required: false, nullable: true })
  gmoIngredient?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  gmoDonorSpecies?: string | null

  @ApiProperty({ type: Number, required: false, nullable: true })
  gmoPercentage?: number | null

  @ApiProperty({ type: Boolean, required: false })
  isIrradiated?: boolean

  @ApiProperty({ type: String, required: false, nullable: true })
  irradiatedIngredient?: string | null

  @ApiProperty({ type: Boolean, required: false })
  containsLactose?: boolean

  @ApiProperty({ type: Boolean, required: false })
  containsGluten?: boolean

  @ApiProperty({ type: Boolean, required: false })
  containsAspartame?: boolean

  @ApiProperty({ enum: FlavorOriginType, enumName: 'FlavorOriginType', required: false, nullable: true })
  flavorOriginType?: FlavorOriginType | null

  @ApiProperty({ enum: ColorantOriginType, enumName: 'ColorantOriginType', required: false, nullable: true })
  colorantOriginType?: ColorantOriginType | null
}
