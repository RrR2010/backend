import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsOptional } from 'class-validator'
import { TechnicalSourceType_PL } from '@ingredients/technical-source-type-pl.entity'
import { SystemState } from '@shared/behaviours/lockable'

// TODO: zod validate dto
export class CreateTechnicalSourceType_PLDto {
  @ApiProperty({ type: String })
  @IsString()
  code!: string

  @ApiProperty({ type: String })
  @IsString()
  name!: string

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
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
