import { ApiProperty } from '@nestjs/swagger'
import { TenantSite } from '@tenant-sites/tenant-site.entity'
import { TenantSiteType } from '@shared/enums'

export class CreateTenantSiteDto {
  @ApiProperty({ type: String })
  tenantId!: string

  @ApiProperty({ type: String })
  name!: string

  @ApiProperty({ type: String })
  legalName!: string

  @ApiProperty({ required: false })
  externalId?: string

  @ApiProperty({ type: String })
  taxId!: string

  @ApiProperty({ enum: TenantSiteType })
  siteType!: TenantSiteType

  @ApiProperty()
  isHeadquarters!: boolean
}

export class CreateTenantSiteResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  tenantId!: string

  @ApiProperty()
  name!: string

  @ApiProperty()
  legalName!: string

  @ApiProperty({ required: false, nullable: true })
  externalId?: string | null

  @ApiProperty()
  taxId!: string

  @ApiProperty({ enum: TenantSiteType })
  siteType!: TenantSiteType

  @ApiProperty()
  isHeadquarters!: boolean

  @ApiProperty()
  systemState!: string

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(site: TenantSite): CreateTenantSiteResponseDto {
    return {
      id: site.id.value,
      tenantId: site.tenantId,
      name: site.name,
      legalName: site.legalName,
      externalId: site.externalId,
      taxId: site.taxId,
      siteType: site.siteType,
      isHeadquarters: site.isHeadquarters,
      systemState: site.systemState,
      createdAt: site.createdAt,
      updatedAt: site.updatedAt
    }
  }
}

export class TenantSiteResponseDto extends CreateTenantSiteResponseDto {}

export class UpdateTenantSiteDto {
  @ApiProperty({ required: false })
  name?: string

  @ApiProperty({ required: false })
  legalName?: string

  @ApiProperty({ required: false })
  externalId?: string

  @ApiProperty({ required: false })
  taxId?: string

  @ApiProperty({ enum: TenantSiteType, required: false })
  siteType?: TenantSiteType

  @ApiProperty({ required: false })
  isHeadquarters?: boolean
}
