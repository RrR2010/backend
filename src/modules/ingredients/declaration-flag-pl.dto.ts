import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsOptional, IsEnum } from 'class-validator'
import { DeclarationFlag_PL } from '@ingredients/declaration-flag-pl.entity'
import { DeclarationFlagScope } from '@prisma/client'
import { SystemState } from '@shared/behaviours/lockable'

// TODO: zod validate dto
export class CreateDeclarationFlag_PLDto {
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

  @ApiProperty({ enum: DeclarationFlagScope, required: false })
  @IsEnum(DeclarationFlagScope)
  @IsOptional()
  appliesTo?: DeclarationFlagScope
}

export class CreateDeclarationFlag_PLResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  code!: string

  @ApiProperty()
  name!: string

  @ApiProperty({ required: false, nullable: true })
  description!: string | null

  @ApiProperty({ enum: DeclarationFlagScope })
  appliesTo!: DeclarationFlagScope

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

  static fromDomain(
    flag: DeclarationFlag_PL
  ): CreateDeclarationFlag_PLResponseDto {
    return {
      id: flag.id.value,
      code: flag.code,
      name: flag.name,
      description: flag.description,
      appliesTo: flag.appliesTo,
      systemState: flag.systemState,
      createdAt: flag.createdAt,
      updatedAt: flag.updatedAt,
      createdBy: flag.createdBy,
      updatedBy: flag.updatedBy
    }
  }
}

export class DeclarationFlag_PLResponseDto extends CreateDeclarationFlag_PLResponseDto {}

export class UpdateDeclarationFlag_PLDto {
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
  description!: string | null

  @ApiProperty({ enum: DeclarationFlagScope, required: false })
  @IsEnum(DeclarationFlagScope)
  @IsOptional()
  appliesTo?: DeclarationFlagScope
}
