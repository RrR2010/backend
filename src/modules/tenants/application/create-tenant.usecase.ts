import { Tenant } from '@modules/tenants/domain/tenant.entity';
import { TenantRepository } from '@modules/tenants/domain/tenant.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateTenantUseCase {
  constructor(private readonly tenantRepository: TenantRepository) {}

  async execute(input: { name: string }): Promise<Tenant> {
    const tenant = await this.tenantRepository.save(
      Tenant.create({ name: input.name }),
    );
    return tenant;
  }
}
