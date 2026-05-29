import { ApiProperty } from '@nestjs/swagger'
import { IngredientLabelingProfile } from '@ingredients/ingredient-labeling-profile.entity'
import { SystemState } from '@shared/behaviours/lockable'

// TODO: zod validate dto
export class CreateIngredientLabelingProfileDto {
  @ApiProperty({ type: String })
  tenantId!: string

  @ApiProperty({ type: String })
  ingredientId!: string

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
}

export class CreateIngredientLabelingProfileResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  tenantId!: string

  @ApiProperty()
  ingredientId!: string

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

  @ApiProperty()
  systemState!: SystemState

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(
    profile: IngredientLabelingProfile
  ): CreateIngredientLabelingProfileResponseDto {
    return {
      id: profile.id.value,
      tenantId: profile.tenantId,
      ingredientId: profile.ingredientId,
      containsAddedSugars: profile.containsAddedSugars,
      containsIngredientWithAddedSugars:
        profile.containsIngredientWithAddedSugars,
      containsNaturallyOccurringSugarSubstitutes:
        profile.containsNaturallyOccurringSugarSubstitutes,
      usesProcessingThatIncreasesSugars:
        profile.usesProcessingThatIncreasesSugars,
      containsAddedFatsOrOils: profile.containsAddedFatsOrOils,
      containsButterOrMargarine: profile.containsButterOrMargarine,
      containsDairyCream: profile.containsDairyCream,
      containsIngredientsWithFatsOrCream:
        profile.containsIngredientsWithFatsOrCream,
      systemState: profile.systemState,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    }
  }
}

export class IngredientLabelingProfileResponseDto extends CreateIngredientLabelingProfileResponseDto {}

export class UpdateIngredientLabelingProfileDto {
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
}
