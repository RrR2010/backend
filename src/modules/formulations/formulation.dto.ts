import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { FormulationVersion } from './formulation-version.entity'
import { FormulationRevision } from './formulation-revision.entity'
import { FormulationItem } from './formulation-item.entity'

// TODO: zod validate dto
export class CreateFormulationVersionDto {
  @ApiProperty({ type: String }) tenantId!: string
  @ApiProperty() productId!: string
  @ApiProperty() version!: number
  @ApiPropertyOptional() notes?: string
}

export class CreateFormulationRevisionDto {
  @ApiProperty() formulationVersionId!: string
  @ApiProperty() revision!: number
  @ApiPropertyOptional() notes?: string
}

export class CreateFormulationItemDto {
  @ApiProperty() formulationRevisionId!: string
  @ApiProperty() ingredientId!: string
  @ApiProperty() quantity!: number
  @ApiPropertyOptional({ default: 'g' }) unit?: string
}

export class FormulationVersionResponseDto {
  @ApiProperty() id!: string
  @ApiProperty() tenantId!: string
  @ApiProperty() productId!: string
  @ApiProperty() version!: number
  @ApiProperty({ nullable: true }) notes!: string | null
  @ApiProperty() createdAt!: Date
  @ApiProperty() updatedAt!: Date

  static fromDomain(v: FormulationVersion): FormulationVersionResponseDto {
    return {
      id: v.id.value,
      tenantId: v.tenantId,
      productId: v.productId,
      version: v.version,
      notes: v.notes,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    }
  }
}

export class FormulationRevisionResponseDto {
  @ApiProperty() id!: string
  @ApiProperty() formulationVersionId!: string
  @ApiProperty() revision!: number
  @ApiProperty({ nullable: true }) notes!: string | null
  @ApiProperty() createdAt!: Date
  @ApiProperty() updatedAt!: Date

  static fromDomain(r: FormulationRevision): FormulationRevisionResponseDto {
    return {
      id: r.id.value,
      formulationVersionId: r.formulationVersionId,
      revision: r.revision,
      notes: r.notes,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }
  }
}

export class FormulationItemResponseDto {
  @ApiProperty() id!: string
  @ApiProperty() formulationRevisionId!: string
  @ApiProperty() ingredientId!: string
  @ApiProperty() quantity!: number
  @ApiProperty() unit!: string
  @ApiProperty() createdAt!: Date
  @ApiProperty() updatedAt!: Date

  static fromDomain(i: FormulationItem): FormulationItemResponseDto {
    return {
      id: i.id.value,
      formulationRevisionId: i.formulationRevisionId,
      ingredientId: i.ingredientId,
      quantity: i.quantity,
      unit: i.unit,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    }
  }
}
