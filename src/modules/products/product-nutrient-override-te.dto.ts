import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsUUID, IsOptional, IsNumber } from 'class-validator'
import { ProductNutrientOverride_TE } from '@products/product-nutrient-override-te.entity'

// TODO: zod validate dto
export class CreateProductNutrientOverride_TEDto {
  @ApiProperty({ type: String })
  @IsUUID()
  @IsString()
  productId!: string

  @ApiProperty({ type: String })
  @IsUUID()
  @IsString()
  nutrientId!: string

  @ApiProperty({ type: Number })
  @IsNumber()
  overriddenValue!: number

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsString()
  @IsOptional()
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
  @IsNumber()
  overriddenValue!: number

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsString()
  @IsOptional()
  notes?: string | null
}
