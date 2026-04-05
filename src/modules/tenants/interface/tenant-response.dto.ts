import { ApiProperty } from '@nestjs/swagger';
import { Tenant } from '@modules/tenants/domain/tenant.entity';

export class TenantResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  static fromDomain(tenant: Tenant) {
    return {
      id: tenant.id.value,
      name: tenant.name,
    };
  }
}
