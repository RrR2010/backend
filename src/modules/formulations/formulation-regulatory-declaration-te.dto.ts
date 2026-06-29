import { ApiProperty } from '@nestjs/swagger'
import { FormulationRegulatoryDeclaration_TE } from './formulation-regulatory-declaration-te.entity'

// TODO: zod validate dto
export class CreateFormulationRegulatoryDeclaration_TEDto {
  @ApiProperty({ type: String })
  formulationRevisionId!: string

  @ApiProperty({ type: String })
  flagId!: string

  @ApiProperty({ type: Boolean })
  flagValue!: boolean

  @ApiProperty({ type: String, required: false, nullable: true })
  notes?: string | null
}

export class CreateFormulationRegulatoryDeclaration_TE_ResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  tenantId!: string

  @ApiProperty()
  formulationRevisionId!: string

  @ApiProperty()
  flagId!: string

  @ApiProperty()
  flagValue!: boolean

  @ApiProperty({ required: false, nullable: true })
  notes!: string | null

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(
    entry: FormulationRegulatoryDeclaration_TE
  ): CreateFormulationRegulatoryDeclaration_TE_ResponseDto {
    return {
      id: entry.id.value,
      tenantId: entry.tenantId,
      formulationRevisionId: entry.formulationRevisionId,
      flagId: entry.flagId,
      flagValue: entry.flagValue,
      notes: entry.notes,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt
    }
  }
}

export class FormulationRegulatoryDeclaration_TE_ResponseDto extends CreateFormulationRegulatoryDeclaration_TE_ResponseDto {}

export class UpdateFormulationRegulatoryDeclaration_TEDto {
  @ApiProperty({ type: Boolean, required: false })
  flagValue?: boolean

  @ApiProperty({ type: String, required: false, nullable: true })
  notes?: string | null
}
