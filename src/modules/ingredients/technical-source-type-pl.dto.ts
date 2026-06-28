import { ApiProperty } from '@nestjs/swagger'
import { TechnicalSourceType_PL } from '@ingredients/technical-source-type-pl.entity'
import { SystemState } from '@shared/behaviours/lockable'

export class CreateTechnicalSourceType_PLDto {
  @ApiProperty({ type: String })
  code!: string

  @ApiProperty({ type: String })
  name!: string

  @ApiProperty({ type: String, required: false, nullable: true })
  description?: string | null
}

export class CreateTechnicalSourceType_PLResponseDto {
  @ApiProperty()
  id!: string

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
    type: TechnicalSourceType_PL
  ): CreateTechnicalSourceType_PLResponseDto {
    return {
      id: type.id.value,
      code: type.code,
      name: type.name,
      description: type.description,
      systemState: type.systemState,
      createdAt: type.createdAt,
      updatedAt: type.updatedAt
    }
  }
}

export class TechnicalSourceType_PLResponseDto extends CreateTechnicalSourceType_PLResponseDto {}

export class UpdateTechnicalSourceType_PLDto {
  @ApiProperty({ type: String, required: false })
  code?: string

  @ApiProperty({ type: String, required: false })
  name?: string

  @ApiProperty({ type: String, required: false, nullable: true })
  description?: string | null
}
