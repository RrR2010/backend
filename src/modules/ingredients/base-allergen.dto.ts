import { ApiProperty } from '@nestjs/swagger'
import { BaseAllergen } from '@ingredients/base-allergen.entity'

export class CreateBaseAllergenDto {
  @ApiProperty({ type: String })
  name!: string

  @ApiProperty({ type: String, required: false, nullable: true })
  category?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  regulatoryRef?: string | null

  @ApiProperty({ type: Number, required: false })
  sortOrder?: number
}

export class CreateBaseAllergenResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  name!: string

  @ApiProperty({ required: false, nullable: true })
  category!: string | null

  @ApiProperty({ required: false, nullable: true })
  regulatoryRef!: string | null

  @ApiProperty()
  sortOrder!: number

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(allergen: BaseAllergen): CreateBaseAllergenResponseDto {
    return {
      id: allergen.id.value,
      name: allergen.name,
      category: allergen.category,
      regulatoryRef: allergen.regulatoryRef,
      sortOrder: allergen.sortOrder,
      createdAt: allergen.createdAt,
      updatedAt: allergen.updatedAt
    }
  }
}

export class BaseAllergenResponseDto extends CreateBaseAllergenResponseDto {}

export class UpdateBaseAllergenDto {
  @ApiProperty({ type: String, required: false })
  name?: string

  @ApiProperty({ type: String, required: false, nullable: true })
  category?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  regulatoryRef?: string | null

  @ApiProperty({ type: Number, required: false })
  sortOrder?: number
}
