import { Injectable } from '@nestjs/common'
import { CreateTenantDto } from '@tenants/tenant.dto'
import { TenantRepository, TenantFilter } from '@tenants/tenant.repository'
import { Tenant } from '@tenants/tenant.entity'

@Injectable()
export class TenantService {
  constructor(private readonly tenantRepository: TenantRepository) {}

  async create(dto: CreateTenantDto, context: RequestContext): Promise<Tenant> {
    const tenant = Tenant.create({
      name: dto.name
    })

    await this.tenantRepository.save(tenant)
    return tenant
  }

  async findAll(
    filter?: TenantFilter,
    context?: RequestContext
  ): Promise<Tenant[]> {
    return this.tenantRepository.findAll(filter)
  }

  async findById(id: string, context: RequestContext): Promise<Tenant | null> {
    return this.tenantRepository.findById(id)
  }

  async save(tenant: Tenant, context: RequestContext): Promise<Tenant> {
    return this.tenantRepository.save(tenant)
  }

  async delete(id: string, context: RequestContext): Promise<void> {
    await this.tenantRepository.delete(id)
  }
}
