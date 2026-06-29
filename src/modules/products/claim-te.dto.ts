import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsOptional } from 'class-validator'
import { Claim_TE } from '@products/claim-te.entity'
import { SystemState } from '@shared/behaviours/lockable'

// TODO: zod validate dto
export class CreateClaim_TEDto {
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

export class CreateClaim_TEDtoResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  tenantId!: string

  @ApiProperty()
  code!: string

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

  static fromDomain(claim: Claim_TE): CreateClaim_TEDtoResponseDto {
    return {
      id: claim.id.value,
      tenantId: claim.tenantId,
      code: claim.code,
      name: claim.name,
      description: claim.description,
      systemState: claim.systemState,
      createdAt: claim.createdAt,
      updatedAt: claim.updatedAt
    }
  }
}

export class Claim_TEDtoResponseDto extends CreateClaim_TEDtoResponseDto {}

export class UpdateClaim_TEDto {
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
