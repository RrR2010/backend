import { Tenant } from '@modules/tenants/domain/entities/tenant.entity';
import { TenantRepository } from '@modules/tenants/domain/repositories/tenant.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListTenantsUseCase {
  constructor(private readonly tenantRepository: TenantRepository) {}

  async execute(): Promise<Tenant[]> {
    return this.tenantRepository.findAll();
  }
}
