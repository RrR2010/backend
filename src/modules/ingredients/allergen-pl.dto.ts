import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsOptional, IsNumber } from 'class-validator'
import { Allergen_PL } from '@ingredients/allergen-pl.entity'
import { SystemState } from '@shared/behaviours/lockable'

// TODO: zod validate dto
export class CreateAllergen_PLDto {
  @ApiProperty({ type: String })
  @IsString()
  name!: string

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  category!: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  regulatoryRef!: string | null

  @ApiProperty({ type: Number, required: false })
  @IsNumber()
  @IsOptional()
  sortOrder?: number
}

export class CreateAllergen_PLResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  name!: string

  @ApiProperty({ required: false, nullable: true })
  category!: string | null

  @ApiProperty({ required: false, nullable: true })
  regulatoryRef!: string | null

  @ApiProperty()
  sortOrder!: number

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

  static fromDomain(allergen: Allergen_PL): CreateAllergen_PLResponseDto {
    return {
      id: allergen.id.value,
      name: allergen.name,
      category: allergen.category,
      regulatoryRef: allergen.regulatoryRef,
      sortOrder: allergen.sortOrder,
      systemState: allergen.systemState,
      createdAt: allergen.createdAt,
      updatedAt: allergen.updatedAt,
      createdBy: allergen.createdBy,
      updatedBy: allergen.updatedBy
    }
  }
}

export class Allergen_PLResponseDto extends CreateAllergen_PLResponseDto {}

export class UpdateAllergen_PLDto {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  name?: string

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  category!: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @IsOptional()
  regulatoryRef!: string | null

  @ApiProperty({ type: Number, required: false })
  @IsNumber()
  @IsOptional()
  sortOrder?: number
}
