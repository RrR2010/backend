import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ProductStatus } from '@prisma/client'
import { Product } from './product.entity'

// TODO: zod validate dto
export class CreateProductDto {
  @ApiProperty({ type: String }) tenantId!: string
  @ApiProperty() name!: string
  @ApiProperty() code!: string
  @ApiPropertyOptional({ enum: ProductStatus, default: 'DRAFT' })
  status?: ProductStatus
  @ApiPropertyOptional() commercialName?: string
  @ApiPropertyOptional() denomination?: string
  @ApiPropertyOptional() productType?: string
  @ApiPropertyOptional() notes?: string
  @ApiPropertyOptional() barcodeGtin?: string
  @ApiPropertyOptional() declaredWeight?: number
  @ApiPropertyOptional() declaredVolume?: number
  @ApiPropertyOptional() shelfLifeDays?: number
  @ApiPropertyOptional() storageConditions?: string
}

export class UpdateProductDto {
  @ApiPropertyOptional() name?: string
  @ApiPropertyOptional() code?: string
  @ApiPropertyOptional({ enum: ProductStatus }) status?: ProductStatus
  @ApiPropertyOptional() commercialName?: string
  @ApiPropertyOptional() denomination?: string
  @ApiPropertyOptional() productType?: string
  @ApiPropertyOptional() notes?: string
  @ApiPropertyOptional() barcodeGtin?: string
  @ApiPropertyOptional() declaredWeight?: number
  @ApiPropertyOptional() declaredVolume?: number
  @ApiPropertyOptional() shelfLifeDays?: number
  @ApiPropertyOptional() storageConditions?: string
}

export class ProductResponseDto {
  @ApiProperty() id!: string
  @ApiProperty() tenantId!: string
  @ApiProperty() name!: string
  @ApiProperty() code!: string
  @ApiProperty({ enum: ProductStatus }) status!: ProductStatus
  @ApiPropertyOptional() commercialName!: string | null
  @ApiPropertyOptional() denomination!: string | null
  @ApiPropertyOptional() productType!: string | null
  @ApiPropertyOptional() notes!: string | null
  @ApiPropertyOptional() barcodeGtin!: string | null
  @ApiPropertyOptional() declaredWeight!: number | null
  @ApiPropertyOptional() declaredVolume!: number | null
  @ApiPropertyOptional() shelfLifeDays!: number | null
  @ApiPropertyOptional() storageConditions!: string | null
  @ApiProperty() createdAt!: Date
  @ApiProperty() updatedAt!: Date

  static fromDomain(product: Product): ProductResponseDto {
    return {
      id: product.id.value,
      tenantId: product.tenantId,
      name: product.name,
      code: product.code,
      status: product.status,
      commercialName: product.commercialName,
      denomination: product.denomination,
      productType: product.productType,
      notes: product.notes,
      barcodeGtin: product.barcodeGtin,
      declaredWeight: product.declaredWeight,
      declaredVolume: product.declaredVolume,
      shelfLifeDays: product.shelfLifeDays,
      storageConditions: product.storageConditions,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }
  }
}
