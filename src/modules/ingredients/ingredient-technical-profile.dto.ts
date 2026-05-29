import { ApiProperty } from '@nestjs/swagger'
import { IngredientTechnicalProfile } from '@ingredients/ingredient-technical-profile.entity'
import { SystemState } from '@shared/behaviours/lockable'

// TODO: zod validate dto
export class CreateIngredientTechnicalProfileDto {
  @ApiProperty({ type: String })
  tenantId!: string

  @ApiProperty({ type: String })
  ingredientId!: string

  @ApiProperty({ type: Number, required: false, nullable: true })
  pac?: number | null

  @ApiProperty({ type: Number, required: false, nullable: true })
  pod?: number | null

  @ApiProperty({ type: Number, required: false, nullable: true })
  totalSolids?: number | null

  @ApiProperty({ type: Number, required: false, nullable: true })
  ashContent?: number | null
}

export class CreateIngredientTechnicalProfileResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  tenantId!: string

  @ApiProperty()
  ingredientId!: string

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

  static fromDomain(
    profile: IngredientTechnicalProfile
  ): CreateIngredientTechnicalProfileResponseDto {
    return {
      id: profile.id.value,
      tenantId: profile.tenantId,
      ingredientId: profile.ingredientId,
      pac: profile.pac,
      pod: profile.pod,
      totalSolids: profile.totalSolids,
      ashContent: profile.ashContent,
      systemState: profile.systemState,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    }
  }
}

export class IngredientTechnicalProfileResponseDto extends CreateIngredientTechnicalProfileResponseDto {}

export class UpdateIngredientTechnicalProfileDto {
  @ApiProperty({ type: Number, required: false, nullable: true })
  pac?: number | null

  @ApiProperty({ type: Number, required: false, nullable: true })
  pod?: number | null

  @ApiProperty({ type: Number, required: false, nullable: true })
  totalSolids?: number | null

  @ApiProperty({ type: Number, required: false, nullable: true })
  ashContent?: number | null
}
