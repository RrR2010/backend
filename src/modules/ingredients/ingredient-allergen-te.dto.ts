import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsUUID, IsEnum } from 'class-validator'
import { IngredientAllergen_TE } from '@ingredients/ingredient-allergen-te.entity'
import { AllergenRelationType } from '@prisma/client'

// TODO: zod validate dto
export class CreateIngredientAllergen_TEDto {
  @ApiProperty({ type: String })
  @IsUUID()
  @IsString()
  ingredientId!: string

  @ApiProperty({ type: String })
  @IsUUID()
  @IsString()
  allergenId!: string

  @ApiProperty({ enum: AllergenRelationType, enumName: 'AllergenRelationType' })
  @IsEnum(AllergenRelationType)
  relationType!: AllergenRelationType
}

export class IngredientAllergen_TE_ResponseDto {
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
  allergenId!: string

  @ApiProperty({ enum: AllergenRelationType, enumName: 'AllergenRelationType' })
  relationType!: AllergenRelationType

  static fromDomain(
    entry: IngredientAllergen_TE
  ): IngredientAllergen_TE_ResponseDto {
    return {
      id: entry.id.value,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      tenantId: entry.tenantId,
      ingredientId: entry.ingredientId,
      allergenId: entry.allergenId,
      relationType: entry.relationType
    }
  }
}
