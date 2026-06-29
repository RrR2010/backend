import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ProductNutrientOverride_TE } from '@products/product-nutrient-override-te.entity'

// TODO: zod validate dto
export class CreateProductNutrientOverride_TEDto {
  @ApiProperty({ type: String })
  tenantId!: string

  @ApiProperty({ type: String })
  productId!: string

  @ApiProperty({ type: String })
  nutrientId!: string

  @ApiProperty({ type: Number })
  overriddenValue!: number

  @ApiPropertyOptional({ type: String, nullable: true })
  notes?: string | null
}

export class ProductNutrientOverride_TE_ResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  tenantId!: string

  @ApiProperty()
  productId!: string

  @ApiProperty()
  nutrientId!: string

  @ApiProperty({ type: Number })
  overriddenValue!: number

  @ApiPropertyOptional({ nullable: true })
  notes!: string | null

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(
    entity: ProductNutrientOverride_TE
  ): ProductNutrientOverride_TE_ResponseDto {
    return {
      id: entity.id.value,
      tenantId: entity.tenantId,
      productId: entity.productId,
      nutrientId: entity.nutrientId,
      overriddenValue: entity.overriddenValue,
      notes: entity.notes,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    }
  }
}

export class UpdateProductNutrientOverride_TEDto {
  @ApiProperty({ type: Number })
  overriddenValue!: number

  @ApiPropertyOptional({ type: String, nullable: true })
  notes?: string | null
}
