import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsUUID, IsOptional, IsNumber, IsDateString } from 'class-validator'
import { IngredientCost_TE } from '@ingredients/ingredient-cost-te.entity'
import { SystemState } from '@shared/behaviours/lockable'

// TODO: zod validate dto
export class CreateIngredientCost_TEDto {
  @ApiProperty({ type: String })
  @IsUUID()
  @IsString()
  ingredientId!: string

  @ApiProperty({ type: Number })
  @IsNumber()
  unitPrice!: number

  @ApiProperty({ type: String })
  @IsString()
  currencyCode!: string

  @ApiProperty({ type: String })
  @IsUUID()
  @IsString()
  unitOfMeasureId!: string

  @ApiProperty({ type: Date })
  @IsDateString()
  effectiveDate!: Date

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsUUID()
  @IsString()
  @IsOptional()
  supplierId?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  notes?: string | null
}

export class CreateIngredientCost_TE_ResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  tenantId!: string

  @ApiProperty()
  ingredientId!: string

  @ApiProperty()
  unitPrice!: number

  @ApiProperty()
  currencyCode!: string

  @ApiProperty()
  unitOfMeasureId!: string

  @ApiProperty()
  effectiveDate!: Date

  @ApiProperty({ required: false, nullable: true })
  supplierId!: string | null

  @ApiProperty({ required: false, nullable: true })
  notes!: string | null

  @ApiProperty()
  systemState!: SystemState

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(entity: IngredientCost_TE): CreateIngredientCost_TE_ResponseDto {
    return {
      id: entity.id.value,
      tenantId: entity.tenantId,
      ingredientId: entity.ingredientId,
      unitPrice: entity.unitPrice,
      currencyCode: entity.currencyCode,
      unitOfMeasureId: entity.unitOfMeasureId,
      effectiveDate: entity.effectiveDate,
      supplierId: entity.supplierId,
      notes: entity.notes,
      systemState: entity.systemState,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    }
  }
}

export class IngredientCost_TE_ResponseDto extends CreateIngredientCost_TE_ResponseDto {}

export class UpdateIngredientCost_TEDto {
  @ApiProperty({ type: Number, required: false })
  @IsNumber()
  @IsOptional()
  unitPrice?: number

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  currencyCode?: string

  @ApiProperty({ type: String, required: false })
  @IsUUID()
  @IsString()
  @IsOptional()
  unitOfMeasureId?: string

  @ApiProperty({ type: Date, required: false })
  @IsDateString()
  @IsOptional()
  effectiveDate?: Date

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsUUID()
  @IsString()
  @IsOptional()
  supplierId?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  notes?: string | null
}
