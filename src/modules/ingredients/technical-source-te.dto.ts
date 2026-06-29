import { ApiProperty } from '@nestjs/swagger'
import { TechnicalSource_TE } from '@ingredients/technical-source-te.entity'
import { SystemState } from '@shared/behaviours/lockable'

// TODO: zod validate dto
export class CreateTechnicalSource_TEDto {
  @ApiProperty({ type: String })
  tenantId!: string

  @ApiProperty({ type: String, required: false, nullable: true })
  sourceTypePlId?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  sourceTypeTeId?: string | null

  @ApiProperty({ type: String })
  referenceName!: string

  @ApiProperty({ type: String, required: false, nullable: true })
  url?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  documentRef?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  notes?: string | null
}

export class CreateTechnicalSource_TE_ResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  tenantId!: string

  @ApiProperty({ required: false, nullable: true })
  sourceTypePlId!: string | null

  @ApiProperty({ required: false, nullable: true })
  sourceTypeTeId!: string | null

  @ApiProperty()
  referenceName!: string

  @ApiProperty({ required: false, nullable: true })
  url!: string | null

  @ApiProperty({ required: false, nullable: true })
  documentRef!: string | null

  @ApiProperty({ required: false, nullable: true })
  notes!: string | null

  @ApiProperty()
  systemState!: SystemState

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(
    source: TechnicalSource_TE
  ): CreateTechnicalSource_TE_ResponseDto {
    return {
      id: source.id.value,
      tenantId: source.tenantId,
      sourceTypePlId: source.sourceTypePlId,
      sourceTypeTeId: source.sourceTypeTeId,
      referenceName: source.referenceName,
      url: source.url,
      documentRef: source.documentRef,
      notes: source.notes,
      systemState: source.systemState,
      createdAt: source.createdAt,
      updatedAt: source.updatedAt
    }
  }
}

export class TechnicalSource_TE_ResponseDto extends CreateTechnicalSource_TE_ResponseDto {}

export class UpdateTechnicalSource_TEDto {
  @ApiProperty({ type: String, required: false, nullable: true })
  sourceTypePlId?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  sourceTypeTeId?: string | null

  @ApiProperty({ type: String, required: false })
  referenceName?: string

  @ApiProperty({ type: String, required: false, nullable: true })
  url?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  documentRef?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  notes?: string | null
}
