import { ApiProperty } from '@nestjs/swagger'
import { Regulation_PL } from '@ingredients/regulation-pl.entity'
import { SystemState } from '@shared/behaviours/lockable'

export class CreateRegulation_PLDto {
  @ApiProperty({ type: String })
  number!: string

  @ApiProperty({ type: Number })
  year!: number

  @ApiProperty({ type: String, required: false, nullable: true })
  title!: string | null

  @ApiProperty({ type: Date, required: false, nullable: true })
  publishedAt!: Date | null

  @ApiProperty({ type: String })
  regulatoryBodyId!: string

  @ApiProperty({ type: String })
  regulationTypeId!: string
}

export class CreateRegulation_PLResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  number!: string

  @ApiProperty()
  year!: number

  @ApiProperty({ required: false, nullable: true })
  title!: string | null

  @ApiProperty({ required: false, nullable: true })
  publishedAt!: Date | null

  @ApiProperty()
  regulatoryBodyId!: string

  @ApiProperty()
  regulationTypeId!: string

  @ApiProperty({ enum: SystemState })
  systemState!: SystemState

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(entity: Regulation_PL): CreateRegulation_PLResponseDto {
    return {
      id: entity.id.value,
      number: entity.number,
      year: entity.year,
      title: entity.title,
      publishedAt: entity.publishedAt,
      regulatoryBodyId: entity.regulatoryBodyId,
      regulationTypeId: entity.regulationTypeId,
      systemState: entity.systemState,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    }
  }
}

export class Regulation_PLResponseDto extends CreateRegulation_PLResponseDto {}

export class UpdateRegulation_PLDto {
  @ApiProperty({ type: String, required: false })
  number?: string

  @ApiProperty({ type: Number, required: false })
  year?: number

  @ApiProperty({ type: String, required: false, nullable: true })
  title?: string | null

  @ApiProperty({ type: Date, required: false, nullable: true })
  publishedAt?: Date | null

  @ApiProperty({ type: String, required: false })
  regulatoryBodyId?: string

  @ApiProperty({ type: String, required: false })
  regulationTypeId?: string
}
