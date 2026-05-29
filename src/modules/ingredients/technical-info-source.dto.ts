import { ApiProperty } from '@nestjs/swagger'
import { TechnicalInfoSource } from '@ingredients/technical-info-source.entity'
import { TechnicalInfoSourceType } from '@prisma/client'
import { SystemState } from '@shared/behaviours/lockable'

// TODO: zod validate dto
export class CreateTechnicalInfoSourceDto {
  @ApiProperty({ type: String })
  tenantId!: string

  @ApiProperty({ enum: TechnicalInfoSourceType })
  sourceType!: TechnicalInfoSourceType

  @ApiProperty({ type: String })
  referenceName!: string

  @ApiProperty({ type: String, required: false, nullable: true })
  url?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  documentRef?: string | null
}

export class CreateTechnicalInfoSourceResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  tenantId!: string

  @ApiProperty({ enum: TechnicalInfoSourceType })
  sourceType!: TechnicalInfoSourceType

  @ApiProperty()
  referenceName!: string

  @ApiProperty({ required: false, nullable: true })
  url!: string | null

  @ApiProperty({ required: false, nullable: true })
  documentRef!: string | null

  @ApiProperty()
  systemState!: SystemState

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(
    source: TechnicalInfoSource
  ): CreateTechnicalInfoSourceResponseDto {
    return {
      id: source.id.value,
      tenantId: source.tenantId,
      sourceType: source.sourceType,
      referenceName: source.referenceName,
      url: source.url,
      documentRef: source.documentRef,
      systemState: source.systemState,
      createdAt: source.createdAt,
      updatedAt: source.updatedAt
    }
  }
}

export class TechnicalInfoSourceResponseDto extends CreateTechnicalInfoSourceResponseDto {}

export class UpdateTechnicalInfoSourceDto {
  @ApiProperty({ enum: TechnicalInfoSourceType, required: false })
  sourceType?: TechnicalInfoSourceType

  @ApiProperty({ type: String, required: false })
  referenceName?: string

  @ApiProperty({ type: String, required: false, nullable: true })
  url?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  documentRef?: string | null
}
