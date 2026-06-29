import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ProductClaim_TE } from '@products/product-claim-te.entity'
import { SystemState } from '@shared/behaviours/lockable'

// TODO: zod validate dto
export class CreateProductClaim_TEDto {
  @ApiProperty({ type: String })
  tenantId!: string

  @ApiProperty({ type: String })
  productId!: string

  @ApiProperty({ type: String })
  claimId!: string

  @ApiPropertyOptional({ type: Boolean, default: true })
  isActive?: boolean

  @ApiPropertyOptional({ type: Number, default: 0 })
  sortOrder?: number
}

export class ProductClaim_TE_ResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  tenantId!: string

  @ApiProperty()
  productId!: string

  @ApiProperty()
  claimId!: string

  @ApiProperty({ type: Boolean })
  isActive!: boolean

  @ApiProperty({ type: Number })
  sortOrder!: number

  @ApiProperty()
  systemState!: SystemState

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(entity: ProductClaim_TE): ProductClaim_TE_ResponseDto {
    return {
      id: entity.id.value,
      tenantId: entity.tenantId,
      productId: entity.productId,
      claimId: entity.claimId,
      isActive: entity.isActive,
      sortOrder: entity.sortOrder,
      systemState: entity.systemState,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    }
  }
}

export class UpdateProductClaim_TEDto {
  @ApiPropertyOptional({ type: Boolean })
  isActive?: boolean

  @ApiPropertyOptional({ type: Number })
  sortOrder?: number
}
