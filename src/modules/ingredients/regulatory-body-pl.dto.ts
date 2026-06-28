import { ApiProperty } from '@nestjs/swagger'
import { RegulatoryBody_PL } from '@ingredients/regulatory-body-pl.entity'
import { SystemState } from '@shared/behaviours/lockable'

export class CreateRegulatoryBody_PLDto {
  @ApiProperty({ type: String, required: false, nullable: true })
  abbreviation!: string | null

  @ApiProperty({ type: String })
  code!: string

  @ApiProperty({ type: String })
  name!: string

  @ApiProperty({ type: String, required: false, nullable: true })
  description!: string | null
}

export class CreateRegulatoryBody_PLResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty({ required: false, nullable: true })
  abbreviation!: string | null

  @ApiProperty()
  code!: string

  @ApiProperty()
  name!: string

  @ApiProperty({ required: false, nullable: true })
  description!: string | null

  @ApiProperty({ enum: SystemState })
  systemState!: SystemState

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(
    entity: RegulatoryBody_PL
  ): CreateRegulatoryBody_PLResponseDto {
    return {
      id: entity.id.value,
      abbreviation: entity.abbreviation,
      code: entity.code,
      name: entity.name,
      description: entity.description,
      systemState: entity.systemState,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    }
  }
}

export class RegulatoryBody_PLResponseDto extends CreateRegulatoryBody_PLResponseDto {}

export class UpdateRegulatoryBody_PLDto {
  @ApiProperty({ type: String, required: false, nullable: true })
  abbreviation?: string | null

  @ApiProperty({ type: String, required: false })
  code?: string

  @ApiProperty({ type: String, required: false })
  name?: string

  @ApiProperty({ type: String, required: false, nullable: true })
  description?: string | null
}
