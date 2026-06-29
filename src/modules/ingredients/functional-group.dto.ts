import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator'
import { FunctionalGroup_TE } from '@ingredients/functional-group.entity'
import { SystemState } from '@shared/behaviours/lockable'

// TODO: zod validate dto
export class CreateFunctionalGroup_TEDto {
  @ApiProperty({ type: String })
  @IsString()
  name!: string

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  code?: string | null

  @ApiProperty({ type: Number, required: false })
  @IsNumber()
  @IsOptional()
  sortOrder?: number

  @ApiProperty({ type: Boolean, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}

export class CreateFunctionalGroup_TE_ResponseDto {
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

  static fromDomain(group: FunctionalGroup_TE): CreateFunctionalGroup_TE_ResponseDto {
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

export class FunctionalGroup_TE_ResponseDto extends CreateFunctionalGroup_TE_ResponseDto {}

export class UpdateFunctionalGroup_TEDto {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  name?: string

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  code?: string | null

  @ApiProperty({ type: Number, required: false })
  @IsNumber()
  @IsOptional()
  sortOrder?: number

  @ApiProperty({ type: Boolean, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
