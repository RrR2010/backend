import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsOptional, IsEnum } from 'class-validator'
import { UnitOfMeasure_PL } from '@formulations/unit-of-measure-pl.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { MeasurementType, MeasurementSystem } from '@prisma/client'

// TODO: zod validate dto
export class CreateUnitOfMeasure_PLDto {
  @ApiProperty({ type: String })
  @IsString()
  code!: string

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  symbol!: string | null

  @ApiProperty({ enum: MeasurementType })
  @IsEnum(MeasurementType)
  measurementType!: MeasurementType

  @ApiProperty({ enum: MeasurementSystem })
  @IsEnum(MeasurementSystem)
  measurementSystem!: MeasurementSystem
}

export class CreateUnitOfMeasure_PLResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  code!: string

  @ApiProperty({ required: false, nullable: true })
  symbol!: string | null

  @ApiProperty({ enum: MeasurementType })
  measurementType!: MeasurementType

  @ApiProperty({ enum: MeasurementSystem })
  measurementSystem!: MeasurementSystem

  @ApiProperty({ enum: SystemState })
  systemState!: SystemState

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  @ApiProperty({ required: false, nullable: true })
  createdBy!: string | null

  @ApiProperty({ required: false, nullable: true })
  updatedBy!: string | null

  static fromDomain(entity: UnitOfMeasure_PL): CreateUnitOfMeasure_PLResponseDto {
    return {
      id: entity.id.value,
      code: entity.code,
      symbol: entity.symbol,
      measurementType: entity.measurementType,
      measurementSystem: entity.measurementSystem,
      systemState: entity.systemState,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy
    }
  }
}

export class UnitOfMeasure_PLResponseDto extends CreateUnitOfMeasure_PLResponseDto {}

export class UpdateUnitOfMeasure_PLDto {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  code?: string

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  symbol!: string | null

  @ApiProperty({ enum: MeasurementType, required: false })
  @IsEnum(MeasurementType)
  @IsOptional()
  measurementType?: MeasurementType

  @ApiProperty({ enum: MeasurementSystem, required: false })
  @IsEnum(MeasurementSystem)
  @IsOptional()
  measurementSystem?: MeasurementSystem
}
