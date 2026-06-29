import { ApiProperty } from '@nestjs/swagger'
import { FormulationOgmDonor_TE } from './formulation-ogm-donor-te.entity'

// TODO: zod validate dto
export class CreateFormulationOgmDonor_TEDto {
  @ApiProperty({ type: String })
  formulationRevisionId!: string

  @ApiProperty({ type: String })
  ogmDonorSpeciesId!: string
}

export class CreateFormulationOgmDonor_TE_ResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  tenantId!: string

  @ApiProperty()
  formulationRevisionId!: string

  @ApiProperty()
  ogmDonorSpeciesId!: string

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(
    entry: FormulationOgmDonor_TE
  ): CreateFormulationOgmDonor_TE_ResponseDto {
    return {
      id: entry.id.value,
      tenantId: entry.tenantId,
      formulationRevisionId: entry.formulationRevisionId,
      ogmDonorSpeciesId: entry.ogmDonorSpeciesId,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt
    }
  }
}

export class FormulationOgmDonor_TE_ResponseDto extends CreateFormulationOgmDonor_TE_ResponseDto {}

export class UpdateFormulationOgmDonor_TEDto {
  @ApiProperty({ type: String, required: false })
  ogmDonorSpeciesId?: string
}
