import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsUUID, IsOptional, IsNumber, IsPositive, IsEnum, Min } from 'class-validator'
import { FormulationVersion_TE } from './formulation-version.entity'
import { FormulationRevision_TE } from './formulation-revision.entity'
import { FormulationItem_TE } from './formulation-item.entity'
import { FormulationRevisionStatus } from '@prisma/client'

// TODO: zod validate dto
export class CreateFormulationVersion_TEDto {
  @ApiProperty()
  @IsUUID()
  @IsString()
  productId!: string

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  version!: number

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string
}

// TODO: zod validate dto
export class CreateFormulationRevision_TEDto {
  @ApiProperty()
  @IsUUID()
  @IsString()
  formulationVersionId!: string

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  revision!: number

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string
}

// TODO: zod validate dto
export class CreateFormulationItem_TEDto {
  @ApiProperty()
  @IsUUID()
  @IsString()
  formulationRevisionId!: string

  @ApiProperty()
  @IsUUID()
  @IsString()
  ingredientId!: string

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  quantity!: number

  @ApiProperty({ type: String })
  @IsUUID()
  @IsString()
  unitId!: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  usageCategory?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  componentGroup?: string

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  sortOrder?: number

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string
}

export class FormulationVersion_TE_ResponseDto {
  @ApiProperty() id!: string
  @ApiProperty() tenantId!: string
  @ApiProperty() productId!: string
  @ApiProperty() version!: number
  @ApiProperty({ nullable: true }) notes!: string | null
  @ApiProperty() createdAt!: Date
  @ApiProperty() updatedAt!: Date

  static fromDomain(version: FormulationVersion_TE): FormulationVersion_TE_ResponseDto {
    return {
      id: version.id.value,
      tenantId: version.tenantId,
      productId: version.productId,
      version: version.version,
      notes: version.notes,
      createdAt: version.createdAt,
      updatedAt: version.updatedAt,
    }
  }
}

export class FormulationRevision_TE_ResponseDto {
  @ApiProperty() id!: string
  @ApiProperty() formulationVersionId!: string
  @ApiProperty() revision!: number
  @ApiProperty({ nullable: true }) notes!: string | null
  @ApiProperty() status!: FormulationRevisionStatus
  @ApiProperty() tenantId!: string
  @ApiProperty({ nullable: true }) approverId!: string | null
  @ApiProperty({ nullable: true }) approvedBy!: string | null
  @ApiProperty({ nullable: true }) approvedAt!: Date | null
  @ApiProperty() drift!: boolean
  @ApiProperty() createdAt!: Date
  @ApiProperty() updatedAt!: Date

  static fromDomain(revision: FormulationRevision_TE): FormulationRevision_TE_ResponseDto {
    return {
      id: revision.id.value,
      formulationVersionId: revision.formulationVersionId,
      revision: revision.revision,
      notes: revision.notes,
      status: revision.status,
      tenantId: revision.tenantId,
      approverId: revision.approverId,
      approvedBy: revision.approvedBy,
      approvedAt: revision.approvedAt,
      drift: revision.drift,
      createdAt: revision.createdAt,
      updatedAt: revision.updatedAt,
    }
  }
}

// TODO: zod validate dto
export class ApproveRevisionDto {
  @ApiProperty()
  @IsUUID()
  @IsString()
  approverId!: string

  @ApiProperty()
  @IsString()
  approvedBy!: string
}

export class FormulationItem_TE_ResponseDto {
  @ApiProperty() id!: string
  @ApiProperty() formulationRevisionId!: string
  @ApiProperty() ingredientId!: string
  @ApiProperty() quantity!: number
  @ApiProperty() unitId!: string
  @ApiProperty() tenantId!: string
  @ApiProperty({ nullable: true }) usageCategory!: string | null
  @ApiProperty({ nullable: true }) componentGroup!: string | null
  @ApiProperty() sortOrder!: number
  @ApiProperty({ nullable: true }) notes!: string | null
  @ApiProperty() createdAt!: Date
  @ApiProperty() updatedAt!: Date

  static fromDomain(item: FormulationItem_TE): FormulationItem_TE_ResponseDto {
    return {
      id: item.id.value,
      formulationRevisionId: item.formulationRevisionId,
      ingredientId: item.ingredientId,
      quantity: item.quantity,
      unitId: item.unitId,
      tenantId: item.tenantId,
      usageCategory: item.usageCategory,
      componentGroup: item.componentGroup,
      sortOrder: item.sortOrder,
      notes: item.notes,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }
  }
}
