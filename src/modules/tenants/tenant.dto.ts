import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Tenant } from '@tenants/tenant.entity'

export class CreateTenantResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  name!: string

  static fromDomain(tenant: Tenant): CreateTenantResponseDto {
    return {
      id: tenant.id.value,
      createdAt: tenant.createdAt,
      name: tenant.name
    }
  }
}

export class CreateTenantDto {
  @ApiProperty({ example: 'My Company', description: 'Tenant name.' })
  name!: string
}

export class TenantResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  name!: string

  static fromDomain(tenant: Tenant): TenantResponseDto {
    return {
      id: tenant.id.value,
      name: tenant.name
    }
  }
}
