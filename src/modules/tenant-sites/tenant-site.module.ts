import { Module } from '@nestjs/common'

import { TenantSiteRepository, PrismaTenantSiteRepository } from '@tenant-sites/tenant-site.repository'
import { TenantSiteService } from '@tenant-sites/tenant-site.service'
import { TenantSitesController } from '@tenant-sites/tenant-site.controller'

@Module({
  imports: [],

  controllers: [TenantSitesController],

  providers: [
    TenantSiteService,
    PrismaTenantSiteRepository,
    {
      provide: TenantSiteRepository,
      useExisting: PrismaTenantSiteRepository
    }
  ],

  exports: [TenantSiteRepository, TenantSiteService]
})
export class TenantSiteModule {}