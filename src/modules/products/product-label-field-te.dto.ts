import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ProductLabelField_TE } from '@products/product-label-field-te.entity'

// TODO: zod validate dto
export class CreateProductLabelField_TEDto {
  @ApiProperty({ type: String })
  tenantId!: string

  @ApiProperty({ type: String })
  productId!: string

  @ApiProperty({ type: String })
  labelFieldId!: string

  @ApiPropertyOptional({ type: String, nullable: true })
  designerValue?: string | null

  @ApiPropertyOptional({ type: String, nullable: true })
  gerencialValue?: string | null
}

export class ProductLabelField_TE_ResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  tenantId!: string

  @ApiProperty()
  productId!: string

  @ApiProperty()
  labelFieldId!: string

  @ApiPropertyOptional({ nullable: true })
  designerValue!: string | null

  @ApiPropertyOptional({ nullable: true })
  gerencialValue!: string | null

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(
    entity: ProductLabelField_TE
  ): ProductLabelField_TE_ResponseDto {
    return {
      id: entity.id.value,
      tenantId: entity.tenantId,
      productId: entity.productId,
      labelFieldId: entity.labelFieldId,
      designerValue: entity.designerValue,
      gerencialValue: entity.gerencialValue,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    }
  }
}

export class UpdateProductLabelField_TEDto {
  @ApiPropertyOptional({ type: String, nullable: true })
  designerValue?: string | null

  @ApiPropertyOptional({ type: String, nullable: true })
  gerencialValue?: string | null
}
