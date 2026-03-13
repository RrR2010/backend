import { Tenant } from '@modules/tenant/domain/entities/tenant.entity';

export abstract class TenantRepository {
  abstract findById(id: string): Promise<Tenant | null>;
  abstract findByName(name: string): Promise<Tenant[]>;
  abstract findAll(): Promise<Tenant[]>;
  abstract save(tenant: Tenant): Promise<Tenant>;
  abstract delete(id: string): Promise<void>;
}
