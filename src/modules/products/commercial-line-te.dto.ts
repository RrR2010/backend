import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsOptional } from 'class-validator'
import { CommercialLine_TE } from '@products/commercial-line-te.entity'
import { SystemState } from '@shared/behaviours/lockable'

// TODO: zod validate dto
export class CreateCommercialLine_TEDto {
  @ApiProperty({ type: String })
  @IsString()
  name!: string

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  description?: string | null
}

export class CreateCommercialLine_TEDtoResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  tenantId!: string

  @ApiProperty()
  name!: string

  @ApiProperty({ required: false, nullable: true })
  description!: string | null

  @ApiProperty()
  systemState!: SystemState

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(line: CommercialLine_TE): CreateCommercialLine_TEDtoResponseDto {
    return {
      id: line.id.value,
      tenantId: line.tenantId,
      name: line.name,
      description: line.description,
      systemState: line.systemState,
      createdAt: line.createdAt,
      updatedAt: line.updatedAt
    }
  }
}

export class CommercialLine_TEDtoResponseDto extends CreateCommercialLine_TEDtoResponseDto {}

export class UpdateCommercialLine_TEDto {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  name?: string

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  description?: string | null
}
