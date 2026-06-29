import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ProductStatus } from '@prisma/client'
import { Product_TE } from './product.entity'

// TODO: zod validate dto
export class CreateProductDto {
  @ApiProperty({ type: String }) tenantId!: string
  @ApiProperty() internalName!: string
  @ApiProperty() code!: string
  @ApiPropertyOptional({ enum: ProductStatus, default: 'DRAFT' })
  status?: ProductStatus
  @ApiPropertyOptional() externalCode?: string
  @ApiPropertyOptional() displayName?: string
  @ApiPropertyOptional() commercialName?: string
  @ApiPropertyOptional() saleDenomination?: string
  @ApiPropertyOptional() productType?: string
  @ApiPropertyOptional() notes?: string
  @ApiPropertyOptional() barcodeGtin?: string
  @ApiPropertyOptional() packagingType?: string
  @ApiPropertyOptional() batchCode?: string
  @ApiPropertyOptional() declaredWeight?: number
  @ApiPropertyOptional() declaredVolume?: number
  @ApiPropertyOptional() shelfLifeDays?: number
  @ApiPropertyOptional() storageConditions?: string
  @ApiPropertyOptional() productFamilyId?: string
  @ApiPropertyOptional() commercialLineId?: string
}

export class UpdateProductDto {
  @ApiPropertyOptional() internalName?: string
  @ApiPropertyOptional() code?: string
  @ApiPropertyOptional({ enum: ProductStatus }) status?: ProductStatus
  @ApiPropertyOptional() externalCode?: string
  @ApiPropertyOptional() displayName?: string
  @ApiPropertyOptional() commercialName?: string
  @ApiPropertyOptional() saleDenomination?: string
  @ApiPropertyOptional() productType?: string
  @ApiPropertyOptional() notes?: string
  @ApiPropertyOptional() barcodeGtin?: string
  @ApiPropertyOptional() packagingType?: string
  @ApiPropertyOptional() batchCode?: string
  @ApiPropertyOptional() declaredWeight?: number
  @ApiPropertyOptional() declaredVolume?: number
  @ApiPropertyOptional() shelfLifeDays?: number
  @ApiPropertyOptional() storageConditions?: string
  @ApiPropertyOptional() productFamilyId?: string
  @ApiPropertyOptional() commercialLineId?: string
}

export class ProductResponseDto {
  @ApiProperty() id!: string
  @ApiProperty() tenantId!: string
  @ApiProperty() internalName!: string
  @ApiProperty() code!: string
  @ApiProperty({ enum: ProductStatus }) status!: ProductStatus
  @ApiPropertyOptional() externalCode!: string | null
  @ApiPropertyOptional() displayName!: string | null
  @ApiPropertyOptional() commercialName!: string | null
  @ApiPropertyOptional() saleDenomination!: string | null
  @ApiPropertyOptional() productType!: string | null
  @ApiPropertyOptional() notes!: string | null
  @ApiPropertyOptional() barcodeGtin!: string | null
  @ApiPropertyOptional() packagingType!: string | null
  @ApiPropertyOptional() batchCode!: string | null
  @ApiPropertyOptional() declaredWeight!: number | null
  @ApiPropertyOptional() declaredVolume!: number | null
  @ApiPropertyOptional() shelfLifeDays!: number | null
  @ApiPropertyOptional() storageConditions!: string | null
  @ApiPropertyOptional() productFamilyId!: string | null
  @ApiPropertyOptional() commercialLineId!: string | null
  @ApiProperty() createdAt!: Date
  @ApiProperty() updatedAt!: Date

  static fromDomain(product: Product_TE): ProductResponseDto {
    return {
      id: product.id.value,
      tenantId: product.tenantId,
      internalName: product.internalName,
      code: product.code,
      status: product.status,
      externalCode: product.externalCode,
      displayName: product.displayName,
      commercialName: product.commercialName,
      saleDenomination: product.saleDenomination,
      productType: product.productType,
      notes: product.notes,
      barcodeGtin: product.barcodeGtin,
      packagingType: product.packagingType,
      batchCode: product.batchCode,
      declaredWeight: product.declaredWeight,
      declaredVolume: product.declaredVolume,
      shelfLifeDays: product.shelfLifeDays,
      storageConditions: product.storageConditions,
      productFamilyId: product.productFamilyId,
      commercialLineId: product.commercialLineId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }
  }
}
