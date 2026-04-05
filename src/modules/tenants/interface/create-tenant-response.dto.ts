import { Tenant } from '@modules/tenants/domain/tenant.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  createdAt!: Date;

  static fromDomain(tenant: Tenant) {
    return {
      id: tenant.id.value,
      createdAt: tenant.createdAt,
      name: tenant.name,
    };
  }
}
