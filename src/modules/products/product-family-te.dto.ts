import { ApiProperty } from '@nestjs/swagger'
import { ProductFamily_TE } from '@products/product-family-te.entity'
import { SystemState } from '@shared/behaviours/lockable'

// TODO: zod validate dto
export class CreateProductFamily_TEDto {
  @ApiProperty({ type: String })
  tenantId!: string

  @ApiProperty({ type: String })
  name!: string

  @ApiProperty({ type: String, required: false, nullable: true })
  description?: string | null
}

export class CreateProductFamily_TEDtoResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  tenantId!: string

  @ApiProperty()
  name!: string

  @ApiProperty({ required: false, nullable: true })
  description!: string | null

  @ApiProperty()
  systemState!: SystemState

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(family: ProductFamily_TE): CreateProductFamily_TEDtoResponseDto {
    return {
      id: family.id.value,
      tenantId: family.tenantId,
      name: family.name,
      description: family.description,
      systemState: family.systemState,
      createdAt: family.createdAt,
      updatedAt: family.updatedAt
    }
  }
}

export class ProductFamily_TEDtoResponseDto extends CreateProductFamily_TEDtoResponseDto {}

export class UpdateProductFamily_TEDto {
  @ApiProperty({ type: String, required: false })
  name?: string

  @ApiProperty({ type: String, required: false, nullable: true })
  description?: string | null
}
