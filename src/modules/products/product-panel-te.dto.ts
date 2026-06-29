import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsUUID, IsOptional, IsNumber, IsEnum, IsObject } from 'class-validator'
import { ProductPanel_TE } from '@products/product-panel-te.entity'
import { ProductPanelType } from '@prisma/client'
import { SystemState } from '@shared/behaviours/lockable'

// TODO: zod validate dto
export class CreateProductPanel_TEDto {
  @ApiProperty({ type: String })
  @IsUUID()
  @IsString()
  productId!: string

  @ApiProperty({ type: Number })
  @IsNumber()
  panelNumber!: number

  @ApiProperty({ enum: ProductPanelType })
  @IsEnum(ProductPanelType)
  type!: ProductPanelType

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsUUID()
  @IsString()
  @IsOptional()
  geometricFormatTypeId?: string | null

  @ApiPropertyOptional({ type: Object, nullable: true })
  @IsObject()
  @IsOptional()
  geometricFormatValues?: Record<string, unknown> | null
}

export class ProductPanel_TE_ResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  tenantId!: string

  @ApiProperty()
  productId!: string

  @ApiProperty({ type: Number })
  panelNumber!: number

  @ApiProperty({ enum: ProductPanelType })
  type!: ProductPanelType

  @ApiPropertyOptional({ nullable: true })
  geometricFormatTypeId!: string | null

  @ApiPropertyOptional({ type: Object, nullable: true })
  geometricFormatValues!: Record<string, unknown> | null

  @ApiProperty()
  systemState!: SystemState

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(entity: ProductPanel_TE): ProductPanel_TE_ResponseDto {
    return {
      id: entity.id.value,
      tenantId: entity.tenantId,
      productId: entity.productId,
      panelNumber: entity.panelNumber,
      type: entity.type,
      geometricFormatTypeId: entity.geometricFormatTypeId,
      geometricFormatValues: entity.geometricFormatValues,
      systemState: entity.systemState,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    }
  }
}

export class UpdateProductPanel_TEDto {
  @ApiPropertyOptional({ type: Number })
  @IsNumber()
  @IsOptional()
  panelNumber?: number

  @ApiPropertyOptional({ enum: ProductPanelType })
  @IsEnum(ProductPanelType)
  @IsOptional()
  type?: ProductPanelType

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsUUID()
  @IsString()
  @IsOptional()
  geometricFormatTypeId?: string | null

  @ApiPropertyOptional({ type: Object, nullable: true })
  @IsObject()
  @IsOptional()
  geometricFormatValues?: Record<string, unknown> | null
}
