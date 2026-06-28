import { ApiProperty } from '@nestjs/swagger'
import { UnitConversion_PL } from '@formulations/unit-conversion-pl.entity'
import { SystemState } from '@shared/behaviours/lockable'

export class CreateUnitConversion_PLDto {
  @ApiProperty({ type: String })
  fromUnitId!: string

  @ApiProperty({ type: String })
  toUnitId!: string

  @ApiProperty({ type: Number })
  factor!: number
}

export class CreateUnitConversion_PLResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  fromUnitId!: string

  @ApiProperty()
  toUnitId!: string

  @ApiProperty()
  factor!: number

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

  static fromDomain(entity: UnitConversion_PL): CreateUnitConversion_PLResponseDto {
    return {
      id: entity.id.value,
      fromUnitId: entity.fromUnitId,
      toUnitId: entity.toUnitId,
      factor: entity.factor,
      systemState: entity.systemState,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy
    }
  }
}

export class UnitConversion_PLResponseDto extends CreateUnitConversion_PLResponseDto {}

export class UpdateUnitConversion_PLDto {
  @ApiProperty({ type: Number, required: false })
  factor?: number
}
