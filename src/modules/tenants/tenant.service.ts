import { Injectable } from '@nestjs/common'
import { CreateTenantDto } from '@tenants/tenant.dto'
import { TenantRepository, TenantFilter } from '@tenants/tenant.repository'
import { Tenant } from '@tenants/tenant.entity'
import { RequestContext } from '@authorization/authorization.types'

@Injectable()
export class TenantService {
  constructor(private readonly tenantRepository: TenantRepository) {}

  async create(dto: CreateTenantDto, ctx: RequestContext): Promise<Tenant> {
    // Generate slug from name if not provided
    const slug = dto.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')

    const tenant = Tenant.create({
      name: dto.name,
      slug,
      website: null,
      locale: 'en-US',
      timezone: 'America/Sao_Paulo',
      language: 'pt-BR',
      logoUrl: null,
      settings: null
    })

    await this.tenantRepository.save(tenant, ctx)
    return tenant
  }

  async findAll(filter: TenantFilter, ctx: RequestContext): Promise<Tenant[]> {
    return this.tenantRepository.findAll(filter, ctx)
  }

  async findById(id: string, ctx: RequestContext): Promise<Tenant | null> {
    return this.tenantRepository.findById(id, ctx)
  }

  async save(tenant: Tenant, ctx: RequestContext): Promise<Tenant> {
    return this.tenantRepository.save(tenant, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    await this.tenantRepository.delete(id, ctx)
  }
}
