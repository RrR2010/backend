import { Tenant } from '@modules/tenants/domain/entities/tenant.entity';
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
      name: tenant.name,
      createdAt: tenant.createdAt,
    };
  }
}
