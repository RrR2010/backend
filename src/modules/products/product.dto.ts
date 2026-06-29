import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsOptional, IsUUID, IsNumber, IsEnum } from 'class-validator'
import { ProductStatus } from '@prisma/client'
import { Product_TE } from '@products/product.entity'

// TODO: zod validate dto
export class CreateProduct_TEDto {
  @ApiProperty()
  @IsString()
  internalName!: string

  @ApiProperty()
  @IsString()
  code!: string

  @ApiPropertyOptional({ enum: ProductStatus, default: 'DRAFT' })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  externalCode?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  displayName?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  commercialName?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  saleDenomination?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  productType?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  barcodeGtin?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  packagingType?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  batchCode?: string

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  declaredWeight?: number

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  declaredVolume?: number

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  shelfLifeDays?: number

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  storageConditions?: string

  @ApiPropertyOptional()
  @IsUUID()
  @IsString()
  @IsOptional()
  productFamilyId?: string

  @ApiPropertyOptional()
  @IsUUID()
  @IsString()
  @IsOptional()
  commercialLineId?: string
}

export class UpdateProduct_TEDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  internalName?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  code?: string

  @ApiPropertyOptional({ enum: ProductStatus })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  externalCode?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  displayName?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  commercialName?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  saleDenomination?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  productType?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  barcodeGtin?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  packagingType?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  batchCode?: string

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  declaredWeight?: number

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  declaredVolume?: number

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  shelfLifeDays?: number

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  storageConditions?: string

  @ApiPropertyOptional()
  @IsUUID()
  @IsString()
  @IsOptional()
  productFamilyId?: string

  @ApiPropertyOptional()
  @IsUUID()
  @IsString()
  @IsOptional()
  commercialLineId?: string
}

export class Product_TE_ResponseDto {
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

  static fromDomain(product: Product_TE): Product_TE_ResponseDto {
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
