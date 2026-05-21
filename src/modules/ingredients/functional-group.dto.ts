import { ApiProperty } from '@nestjs/swagger'
import { FunctionalGroup } from '@ingredients/functional-group.entity'
import { SystemState } from '@shared/behaviours/lockable'

// TODO: zod validate dto
export class CreateFunctionalGroupDto {
  @ApiProperty({ type: String })
  tenantId!: string

  @ApiProperty({ type: String })
  name!: string

  @ApiProperty({ type: String, required: false, nullable: true })
  code?: string | null

  @ApiProperty({ type: Number, required: false })
  sortOrder?: number

  @ApiProperty({ type: Boolean, required: false })
  isActive?: boolean
}

export class CreateFunctionalGroupResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  tenantId!: string

  @ApiProperty()
  name!: string

  @ApiProperty({ required: false, nullable: true })
  code!: string | null

  @ApiProperty()
  sortOrder!: number

  @ApiProperty()
  isActive!: boolean

  @ApiProperty()
  systemState!: SystemState

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(group: FunctionalGroup): CreateFunctionalGroupResponseDto {
    return {
      id: group.id.value,
      tenantId: group.tenantId,
      name: group.name,
      code: group.code,
      sortOrder: group.sortOrder,
      isActive: group.isActive,
      systemState: group.systemState,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt
    }
  }
}

export class FunctionalGroupResponseDto extends CreateFunctionalGroupResponseDto {}

export class UpdateFunctionalGroupDto {
  @ApiProperty({ type: String, required: false })
  name?: string

  @ApiProperty({ type: String, required: false, nullable: true })
  code?: string | null

  @ApiProperty({ type: Number, required: false })
  sortOrder?: number

  @ApiProperty({ type: Boolean, required: false })
  isActive?: boolean
}
