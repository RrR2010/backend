import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsOptional } from 'class-validator'
import { RegulationType_PL } from '@ingredients/regulation-type-pl.entity'
import { SystemState } from '@shared/behaviours/lockable'

// TODO: zod validate dto
export class CreateRegulationType_PLDto {
  @ApiProperty({ type: String })
  @IsString()
  abbreviation!: string

  @ApiProperty({ type: String })
  @IsString()
  code!: string

  @ApiProperty({ type: String })
  @IsString()
  name!: string

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  description!: string | null
}

export class CreateRegulationType_PLResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  abbreviation!: string

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
    entity: RegulationType_PL
  ): CreateRegulationType_PLResponseDto {
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

export class RegulationType_PLResponseDto extends CreateRegulationType_PLResponseDto {}

export class UpdateRegulationType_PLDto {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  abbreviation?: string

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  code?: string

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  name?: string

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  description?: string | null
}
