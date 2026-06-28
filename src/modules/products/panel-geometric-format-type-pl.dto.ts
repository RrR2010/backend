import { ApiProperty } from '@nestjs/swagger'
import { PanelGeometricFormatType_PL } from '@products/panel-geometric-format-type-pl.entity'
import { SystemState } from '@shared/behaviours/lockable'

export class CreatePanelGeometricFormatType_PLDto {
  @ApiProperty({ type: String })
  formatName!: string

  @ApiProperty({
    type: Object,
    required: false,
    nullable: true,
    description: 'JSON object defining the value fields for this geometric format'
  })
  valueFields?: Record<string, unknown> | null

  @ApiProperty({ type: String, required: false, nullable: true })
  calculationFormula?: string | null
}

export class CreatePanelGeometricFormatType_PLResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  formatName!: string

  @ApiProperty({ required: false, nullable: true })
  valueFields!: Record<string, unknown> | null

  @ApiProperty({ required: false, nullable: true })
  calculationFormula!: string | null

  @ApiProperty({ enum: SystemState })
  systemState!: SystemState

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(
    format: PanelGeometricFormatType_PL
  ): CreatePanelGeometricFormatType_PLResponseDto {
    return {
      id: format.id.value,
      formatName: format.formatName,
      valueFields: format.valueFields,
      calculationFormula: format.calculationFormula,
      systemState: format.systemState,
      createdAt: format.createdAt,
      updatedAt: format.updatedAt
    }
  }
}

export class PanelGeometricFormatType_PLResponseDto extends CreatePanelGeometricFormatType_PLResponseDto {}

export class UpdatePanelGeometricFormatType_PLDto {
  @ApiProperty({ type: String, required: false })
  formatName?: string

  @ApiProperty({
    type: Object,
    required: false,
    nullable: true,
    description: 'JSON object defining the value fields for this geometric format'
  })
  valueFields?: Record<string, unknown> | null

  @ApiProperty({ type: String, required: false, nullable: true })
  calculationFormula?: string | null
}
