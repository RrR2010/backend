import { ApiProperty } from '@nestjs/swagger'
import { IngredientCost_TE } from '@ingredients/ingredient-cost-te.entity'
import { SystemState } from '@shared/behaviours/lockable'

// TODO: zod validate dto
export class CreateIngredientCost_TEDto {
  @ApiProperty({ type: String, required: false })
  tenantId?: string

  @ApiProperty({ type: String })
  ingredientId!: string

  @ApiProperty({ type: Number })
  unitPrice!: number

  @ApiProperty({ type: String })
  currencyCode!: string

  @ApiProperty({ type: String })
  unitOfMeasureId!: string

  @ApiProperty({ type: Date })
  effectiveDate!: Date

  @ApiProperty({ type: String, required: false, nullable: true })
  supplierId?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
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
  unitPrice?: number

  @ApiProperty({ type: String, required: false })
  currencyCode?: string

  @ApiProperty({ type: String, required: false })
  unitOfMeasureId?: string

  @ApiProperty({ type: Date, required: false })
  effectiveDate?: Date

  @ApiProperty({ type: String, required: false, nullable: true })
  supplierId?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  notes?: string | null
}
