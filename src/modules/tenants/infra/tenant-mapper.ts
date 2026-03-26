import { EntityStatus } from '@core/domain/entity-status.enum';
import { Id } from '@core/domain/id.vo';
import { Tenant } from '@modules/tenants/domain/tenant.entity';
import { Tenant as PrismaTenant } from '@prisma/client';

export class TenantMapper {
  static toDomain(bdTenant: PrismaTenant) {
    return Tenant.rehydrate({
      id: Id.from(bdTenant.id),
      createdAt: bdTenant.createdAt,
      updatedAt: bdTenant.updatedAt,
      entityStatus:
        EntityStatus[bdTenant.entityStatus as keyof typeof EntityStatus],
      name: bdTenant.name,
    });
  }

  static toPersistence(tenant: Tenant): PrismaTenant {
    return {
      id: tenant.id.value,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
      entityStatus: tenant.entityStatus,
      name: tenant.name,
    };
  }
}
