import { ApiProperty } from '@nestjs/swagger'
import { TechnicalSourceType_TE } from '@ingredients/technical-source-type-te.entity'
import { SystemState } from '@shared/behaviours/lockable'

// TODO: zod validate dto
export class CreateTechnicalSourceType_TEDto {
  @ApiProperty({ type: String })
  tenantId!: string

  @ApiProperty({ type: String })
  name!: string

  @ApiProperty({ type: String, required: false, nullable: true })
  description?: string | null
}

export class CreateTechnicalSourceType_TEDtoResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  tenantId!: string

  @ApiProperty()
  name!: string

  @ApiProperty({ required: false, nullable: true })
  description!: string | null

  @ApiProperty()
  systemState!: SystemState

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(source: TechnicalSourceType_TE): CreateTechnicalSourceType_TEDtoResponseDto {
    return {
      id: source.id.value,
      tenantId: source.tenantId,
      name: source.name,
      description: source.description,
      systemState: source.systemState,
      createdAt: source.createdAt,
      updatedAt: source.updatedAt
    }
  }
}

export class TechnicalSourceType_TEDtoResponseDto extends CreateTechnicalSourceType_TEDtoResponseDto {}

export class UpdateTechnicalSourceType_TEDto {
  @ApiProperty({ type: String, required: false })
  name?: string

  @ApiProperty({ type: String, required: false, nullable: true })
  description?: string | null
}
