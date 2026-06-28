import { ApiProperty } from '@nestjs/swagger'
import { ProductSubcategory_PL } from '@products/product-subcategory-pl.entity'
import { SystemState } from '@shared/behaviours/lockable'

export class CreateProductSubcategory_PLDto {
  @ApiProperty({ type: String })
  categoryId!: string

  @ApiProperty({ type: String })
  code!: string

  @ApiProperty({ type: String })
  name!: string

  @ApiProperty({ type: Number })
  sequentialNumber!: number
}

export class CreateProductSubcategory_PLResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  categoryId!: string

  @ApiProperty()
  code!: string

  @ApiProperty()
  name!: string

  @ApiProperty()
  sequentialNumber!: number

  @ApiProperty({ enum: SystemState })
  systemState!: SystemState

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(
    subcategory: ProductSubcategory_PL
  ): CreateProductSubcategory_PLResponseDto {
    return {
      id: subcategory.id.value,
      categoryId: subcategory.categoryId,
      code: subcategory.code,
      name: subcategory.name,
      sequentialNumber: subcategory.sequentialNumber,
      systemState: subcategory.systemState,
      createdAt: subcategory.createdAt,
      updatedAt: subcategory.updatedAt
    }
  }
}

export class ProductSubcategory_PLResponseDto extends CreateProductSubcategory_PLResponseDto {}

export class UpdateProductSubcategory_PLDto {
  @ApiProperty({ type: String, required: false })
  categoryId?: string

  @ApiProperty({ type: String, required: false })
  code?: string

  @ApiProperty({ type: String, required: false })
  name?: string

  @ApiProperty({ type: Number, required: false })
  sequentialNumber?: number
}
