import { ApiProperty } from '@nestjs/swagger'
import { IngredientFlag_TE } from '@ingredients/ingredient-flag-te.entity'
import { SystemState } from '@shared/behaviours/lockable'

// TODO: zod validate dto
export class CreateIngredientFlag_TEDto {
  @ApiProperty({ type: String, required: false })
  tenantId?: string

  @ApiProperty({ type: String })
  ingredientId!: string

  @ApiProperty({ type: String })
  flagId!: string

  @ApiProperty({ type: Boolean })
  flagValue!: boolean

  @ApiProperty({ type: String, required: false, nullable: true })
  notes?: string | null
}

export class CreateIngredientFlag_TE_ResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  tenantId!: string

  @ApiProperty()
  ingredientId!: string

  @ApiProperty()
  flagId!: string

  @ApiProperty()
  flagValue!: boolean

  @ApiProperty({ required: false, nullable: true })
  notes!: string | null

  @ApiProperty()
  systemState!: SystemState

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(
    entry: IngredientFlag_TE
  ): CreateIngredientFlag_TE_ResponseDto {
    return {
      id: entry.id.value,
      tenantId: entry.tenantId,
      ingredientId: entry.ingredientId,
      flagId: entry.flagId,
      flagValue: entry.flagValue,
      notes: entry.notes,
      systemState: entry.systemState,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt
    }
  }
}

export class IngredientFlag_TE_ResponseDto extends CreateIngredientFlag_TE_ResponseDto {}

export class UpdateIngredientFlag_TEDto {
  @ApiProperty({ type: Boolean, required: false })
  flagValue?: boolean

  @ApiProperty({ type: String, required: false, nullable: true })
  notes?: string | null
}
