import { Tenant } from '@modules/tenants/domain/tenant.entity';
import { TenantRepository } from '@modules/tenants/domain/tenant.repository';
import { Injectable, ForbiddenException } from '@nestjs/common';
import { TenantContextService } from '@core/infra/tenant-context.service';

@Injectable()
export class ListTenantsUseCase {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly tenantContext: TenantContextService,
  ) {}

  async execute(): Promise<Tenant[]> {
    // SECURITY: Only platform-scoped users can list all tenants
    if (!this.tenantContext.isPlatformScope()) {
      throw new ForbiddenException(
        'Only platform-scoped users can list all tenants',
      );
    }
    return this.tenantRepository.findAll();
  }
}
