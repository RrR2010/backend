import { ApiProperty } from '@nestjs/swagger'
import { LabelField_PL } from '@products/label-field-pl.entity'
import { SystemState } from '@shared/behaviours/lockable'

export class CreateLabelField_PLDto {
  @ApiProperty({ type: String })
  fieldName!: string

  @ApiProperty({ type: Number, required: false })
  sortOrder?: number
}

export class CreateLabelField_PLResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  fieldName!: string

  @ApiProperty()
  sortOrder!: number

  @ApiProperty({ enum: SystemState })
  systemState!: SystemState

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(labelField: LabelField_PL): CreateLabelField_PLResponseDto {
    return {
      id: labelField.id.value,
      fieldName: labelField.fieldName,
      sortOrder: labelField.sortOrder,
      systemState: labelField.systemState,
      createdAt: labelField.createdAt,
      updatedAt: labelField.updatedAt
    }
  }
}

export class LabelField_PLResponseDto extends CreateLabelField_PLResponseDto {}

export class UpdateLabelField_PLDto {
  @ApiProperty({ type: String, required: false })
  fieldName?: string

  @ApiProperty({ type: Number, required: false })
  sortOrder?: number
}
