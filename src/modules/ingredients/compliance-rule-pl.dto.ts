import { ApiProperty } from '@nestjs/swagger'
import { ComplianceRule_PL } from '@ingredients/compliance-rule-pl.entity'
import { SystemState } from '@shared/behaviours/lockable'

export class CreateComplianceRule_PLDto {
  @ApiProperty({ type: String })
  code!: string

  @ApiProperty({ type: String })
  category!: string

  @ApiProperty({ type: String })
  ruleType!: string

  @ApiProperty({ type: String })
  description!: string

  @ApiProperty({ type: Object, required: false, nullable: true })
  condition!: Record<string, unknown> | null

  @ApiProperty({ type: String, required: false })
  severity!: string

  @ApiProperty({ type: String })
  regulationId!: string

  @ApiProperty({ type: String, required: false, nullable: true })
  nutrientId!: string | null
}

export class CreateComplianceRule_PLResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  code!: string

  @ApiProperty()
  category!: string

  @ApiProperty()
  ruleType!: string

  @ApiProperty()
  description!: string

  @ApiProperty({ required: false, nullable: true })
  condition!: Record<string, unknown> | null

  @ApiProperty()
  severity!: string

  @ApiProperty()
  regulationId!: string

  @ApiProperty({ required: false, nullable: true })
  nutrientId!: string | null

  @ApiProperty({ enum: SystemState })
  systemState!: SystemState

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(
    entity: ComplianceRule_PL
  ): CreateComplianceRule_PLResponseDto {
    return {
      id: entity.id.value,
      code: entity.code,
      category: entity.category,
      ruleType: entity.ruleType,
      description: entity.description,
      condition: entity.condition,
      severity: entity.severity,
      regulationId: entity.regulationId,
      nutrientId: entity.nutrientId,
      systemState: entity.systemState,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    }
  }
}

export class ComplianceRule_PLResponseDto extends CreateComplianceRule_PLResponseDto {}

export class UpdateComplianceRule_PLDto {
  @ApiProperty({ type: String, required: false })
  code?: string

  @ApiProperty({ type: String, required: false })
  category?: string

  @ApiProperty({ type: String, required: false })
  ruleType?: string

  @ApiProperty({ type: String, required: false })
  description?: string

  @ApiProperty({ type: Object, required: false, nullable: true })
  condition?: Record<string, unknown> | null

  @ApiProperty({ type: String, required: false })
  severity?: string

  @ApiProperty({ type: String, required: false })
  regulationId?: string

  @ApiProperty({ type: String, required: false, nullable: true })
  nutrientId?: string | null
}
