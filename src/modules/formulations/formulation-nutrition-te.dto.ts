import { ApiProperty } from '@nestjs/swagger'
import { FormulationNutrition_TE } from './formulation-nutrition-te.entity'

// TODO: zod validate dto
export class CreateFormulationNutrition_TEDto {
  @ApiProperty({ type: String })
  formulationRevisionId!: string

  @ApiProperty({ type: String })
  nutrientId!: string

  @ApiProperty({ type: Number, required: false, nullable: true })
  declaredValue?: number | null

  @ApiProperty({ type: Number, required: false, nullable: true })
  calculatedValue?: number | null

  @ApiProperty({ type: Number, required: false, nullable: true })
  refValue?: number | null

  @ApiProperty({ type: String, required: false, nullable: true })
  notes?: string | null
}

export class CreateFormulationNutrition_TE_ResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  tenantId!: string

  @ApiProperty()
  formulationRevisionId!: string

  @ApiProperty()
  nutrientId!: string

  @ApiProperty({ required: false, nullable: true })
  declaredValue!: number | null

  @ApiProperty({ required: false, nullable: true })
  calculatedValue!: number | null

  @ApiProperty({ required: false, nullable: true })
  refValue!: number | null

  @ApiProperty({ required: false, nullable: true })
  notes!: string | null

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(
    entry: FormulationNutrition_TE
  ): CreateFormulationNutrition_TE_ResponseDto {
    return {
      id: entry.id.value,
      tenantId: entry.tenantId,
      formulationRevisionId: entry.formulationRevisionId,
      nutrientId: entry.nutrientId,
      declaredValue: entry.declaredValue,
      calculatedValue: entry.calculatedValue,
      refValue: entry.refValue,
      notes: entry.notes,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt
    }
  }
}

export class FormulationNutrition_TE_ResponseDto extends CreateFormulationNutrition_TE_ResponseDto {}

export class UpdateFormulationNutrition_TEDto {
  @ApiProperty({ type: Number, required: false, nullable: true })
  declaredValue?: number | null

  @ApiProperty({ type: Number, required: false, nullable: true })
  calculatedValue?: number | null

  @ApiProperty({ type: Number, required: false, nullable: true })
  refValue?: number | null

  @ApiProperty({ type: String, required: false, nullable: true })
  notes?: string | null
}
