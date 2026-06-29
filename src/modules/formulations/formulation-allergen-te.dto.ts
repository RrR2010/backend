import { ApiProperty } from '@nestjs/swagger'
import { FormulationAllergen_TE } from './formulation-allergen-te.entity'

// TODO: zod validate dto
export class CreateFormulationAllergen_TEDto {
  @ApiProperty({ type: String })
  formulationRevisionId!: string

  @ApiProperty({ type: String, required: false, nullable: true })
  allergenDeclaration?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  allergenMayContain?: string | null
}

export class CreateFormulationAllergen_TE_ResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  tenantId!: string

  @ApiProperty()
  formulationRevisionId!: string

  @ApiProperty({ required: false, nullable: true })
  allergenDeclaration!: string | null

  @ApiProperty({ required: false, nullable: true })
  allergenMayContain!: string | null

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(
    entry: FormulationAllergen_TE
  ): CreateFormulationAllergen_TE_ResponseDto {
    return {
      id: entry.id.value,
      tenantId: entry.tenantId,
      formulationRevisionId: entry.formulationRevisionId,
      allergenDeclaration: entry.allergenDeclaration,
      allergenMayContain: entry.allergenMayContain,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt
    }
  }
}

export class FormulationAllergen_TE_ResponseDto extends CreateFormulationAllergen_TE_ResponseDto {}

export class UpdateFormulationAllergen_TEDto {
  @ApiProperty({ type: String, required: false, nullable: true })
  allergenDeclaration?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  allergenMayContain?: string | null
}
