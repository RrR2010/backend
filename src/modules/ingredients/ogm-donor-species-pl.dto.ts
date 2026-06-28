import { ApiProperty } from '@nestjs/swagger'
import { OgmDonorSpecies_PL } from '@ingredients/ogm-donor-species-pl.entity'
import { SystemState } from '@shared/behaviours/lockable'

export class CreateOgmDonorSpecies_PLDto {
  @ApiProperty({ type: String })
  scientificName!: string

  @ApiProperty({ type: String, required: false, nullable: true })
  commonName?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  category?: string | null
}

export class CreateOgmDonorSpecies_PLResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  scientificName!: string

  @ApiProperty({ required: false, nullable: true })
  commonName!: string | null

  @ApiProperty({ required: false, nullable: true })
  category!: string | null

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
    species: OgmDonorSpecies_PL
  ): CreateOgmDonorSpecies_PLResponseDto {
    return {
      id: species.id.value,
      scientificName: species.scientificName,
      commonName: species.commonName,
      category: species.category,
      systemState: species.systemState,
      createdAt: species.createdAt,
      updatedAt: species.updatedAt,
      createdBy: species.createdBy,
      updatedBy: species.updatedBy
    }
  }
}

export class OgmDonorSpecies_PLResponseDto extends CreateOgmDonorSpecies_PLResponseDto {}

export class UpdateOgmDonorSpecies_PLDto {
  @ApiProperty({ type: String, required: false })
  scientificName?: string

  @ApiProperty({ type: String, required: false, nullable: true })
  commonName?: string | null

  @ApiProperty({ type: String, required: false, nullable: true })
  category?: string | null
}
