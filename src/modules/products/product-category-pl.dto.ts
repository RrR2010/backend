import { ApiProperty } from '@nestjs/swagger'
import { ProductCategory_PL } from '@products/product-category-pl.entity'
import { SystemState } from '@shared/behaviours/lockable'

export class CreateProductCategory_PLDto {
  @ApiProperty({ type: String })
  code!: string

  @ApiProperty({ type: String })
  name!: string

  @ApiProperty({ type: String, required: false, nullable: true })
  description?: string | null

  @ApiProperty({ type: Number })
  sequentialNumber!: number
}

export class CreateProductCategory_PLResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  code!: string

  @ApiProperty()
  name!: string

  @ApiProperty({ required: false, nullable: true })
  description!: string | null

  @ApiProperty()
  sequentialNumber!: number

  @ApiProperty({ enum: SystemState })
  systemState!: SystemState

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(
    category: ProductCategory_PL
  ): CreateProductCategory_PLResponseDto {
    return {
      id: category.id.value,
      code: category.code,
      name: category.name,
      description: category.description,
      sequentialNumber: category.sequentialNumber,
      systemState: category.systemState,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    }
  }
}

export class ProductCategory_PLResponseDto extends CreateProductCategory_PLResponseDto {}

export class UpdateProductCategory_PLDto {
  @ApiProperty({ type: String, required: false })
  code?: string

  @ApiProperty({ type: String, required: false })
  name?: string

  @ApiProperty({ type: String, required: false, nullable: true })
  description?: string | null

  @ApiProperty({ type: Number, required: false })
  sequentialNumber?: number
}
