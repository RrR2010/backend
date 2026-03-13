import { Id } from '@core/domain/value-objects/id.vo';
import { Tenant } from '@modules/tenant/domain/entities/tenant.entity';
import { TenantStatus } from '@modules/tenant/domain/enums/tenant-status';
import { Tenant as PrismaTenant } from '@prisma/client';

export class TenantMapper {
  static toDomain(bdTenant: PrismaTenant) {
    return Tenant.rehydrate({
      id: Id.from(bdTenant.id),
      name: bdTenant.name,
      status: TenantStatus[bdTenant.status as keyof typeof TenantStatus],
      createdAt: bdTenant.createdAt,
      updatedAt: bdTenant.updatedAt,
    });
  }

  static toPersistence(tenant: Tenant): PrismaTenant {
    return {
      id: tenant.id.value,
      name: tenant.name,
      status: tenant.status,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    };
  }
}
