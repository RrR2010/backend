import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsOptional, IsUUID, IsNumber, IsDateString } from 'class-validator'
import { Regulation_PL } from '@ingredients/regulation-pl.entity'
import { SystemState } from '@shared/behaviours/lockable'

// TODO: zod validate dto
export class CreateRegulation_PLDto {
  @ApiProperty({ type: String })
  @IsString()
  number!: string

  @ApiProperty({ type: Number })
  @IsNumber()
  year!: number

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  title!: string | null

  @ApiProperty({ type: Date, required: false, nullable: true })
  @IsDateString()
  @IsOptional()
  publishedAt!: Date | null

  @ApiProperty({ type: String })
  @IsUUID()
  @IsString()
  regulatoryBodyId!: string

  @ApiProperty({ type: String })
  @IsUUID()
  @IsString()
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
  @IsString()
  @IsOptional()
  number?: string

  @ApiProperty({ type: Number, required: false })
  @IsNumber()
  @IsOptional()
  year?: number

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  title?: string | null

  @ApiProperty({ type: Date, required: false, nullable: true })
  @IsDateString()
  @IsOptional()
  publishedAt?: Date | null

  @ApiProperty({ type: String, required: false })
  @IsUUID()
  @IsString()
  @IsOptional()
  regulatoryBodyId?: string

  @ApiProperty({ type: String, required: false })
  @IsUUID()
  @IsString()
  @IsOptional()
  regulationTypeId?: string
}
