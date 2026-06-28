import { Module } from '@nestjs/common'
import { PrismaModule } from '@shared/prisma/prisma.module'
import { AuditLogModule } from '@audit-logs/audit-log.module'
import { ProductsController } from './product.controller'
import { ProductService } from './product.service'
import {
  PrismaProductRepository,
  ProductRepository
} from './product.repository'
import { LabelField_PLController } from './label-field-pl.controller'
import { LabelField_PLService } from './label-field-pl.service'
import {
  PrismaLabelField_PLRepository,
  LabelField_PLRepository
} from './label-field-pl.repository'
import { ProductCategory_PLController } from './product-category-pl.controller'
import { ProductCategory_PLService } from './product-category-pl.service'
import {
  PrismaProductCategory_PLRepository,
  ProductCategory_PLRepository
} from './product-category-pl.repository'
import { ProductSubcategory_PLController } from './product-subcategory-pl.controller'
import { ProductSubcategory_PLService } from './product-subcategory-pl.service'
import {
  PrismaProductSubcategory_PLRepository,
  ProductSubcategory_PLRepository
} from './product-subcategory-pl.repository'
import { PanelGeometricFormatType_PLController } from './panel-geometric-format-type-pl.controller'
import { PanelGeometricFormatType_PLService } from './panel-geometric-format-type-pl.service'
import {
  PrismaPanelGeometricFormatType_PLRepository,
  PanelGeometricFormatType_PLRepository
} from './panel-geometric-format-type-pl.repository'

// Tenant-scoped product catalogs
import { Claim_TEService } from './claim-te.service'
import {
  Claim_TE_Repository,
  PrismaClaim_TE_Repository
} from './claim-te.repository'
import { ClaimsController } from './claim-te.controller'
import { ProductFamily_TEService } from './product-family-te.service'
import {
  ProductFamily_TE_Repository,
  PrismaProductFamily_TE_Repository
} from './product-family-te.repository'
import { ProductFamiliesController } from './product-family-te.controller'
import { CommercialLine_TEService } from './commercial-line-te.service'
import {
  CommercialLine_TE_Repository,
  PrismaCommercialLine_TE_Repository
} from './commercial-line-te.repository'
import { CommercialLinesController } from './commercial-line-te.controller'

@Module({
  imports: [PrismaModule, AuditLogModule],
  controllers: [
    ProductsController,
    LabelField_PLController,
    ProductCategory_PLController,
    ProductSubcategory_PLController,
    PanelGeometricFormatType_PLController,
    ClaimsController,
    ProductFamiliesController,
    CommercialLinesController
  ],
  providers: [
    ProductService,
    PrismaProductRepository,
    { provide: ProductRepository, useExisting: PrismaProductRepository },
    LabelField_PLService,
    PrismaLabelField_PLRepository,
    {
      provide: LabelField_PLRepository,
      useExisting: PrismaLabelField_PLRepository
    },
    ProductCategory_PLService,
    PrismaProductCategory_PLRepository,
    {
      provide: ProductCategory_PLRepository,
      useExisting: PrismaProductCategory_PLRepository
    },
    ProductSubcategory_PLService,
    PrismaProductSubcategory_PLRepository,
    {
      provide: ProductSubcategory_PLRepository,
      useExisting: PrismaProductSubcategory_PLRepository
    },
    PanelGeometricFormatType_PLService,
    PrismaPanelGeometricFormatType_PLRepository,
    {
      provide: PanelGeometricFormatType_PLRepository,
      useExisting: PrismaPanelGeometricFormatType_PLRepository
    },
    // Tenant-scoped product catalogs
    Claim_TEService,
    PrismaClaim_TE_Repository,
    { provide: Claim_TE_Repository, useExisting: PrismaClaim_TE_Repository },
    ProductFamily_TEService,
    PrismaProductFamily_TE_Repository,
    {
      provide: ProductFamily_TE_Repository,
      useExisting: PrismaProductFamily_TE_Repository
    },
    CommercialLine_TEService,
    PrismaCommercialLine_TE_Repository,
    {
      provide: CommercialLine_TE_Repository,
      useExisting: PrismaCommercialLine_TE_Repository
    }
  ],
  exports: [
    ProductRepository,
    ProductService,
    LabelField_PLRepository,
    LabelField_PLService,
    ProductCategory_PLRepository,
    ProductCategory_PLService,
    ProductSubcategory_PLRepository,
    ProductSubcategory_PLService,
    PanelGeometricFormatType_PLRepository,
    PanelGeometricFormatType_PLService,
    // Tenant-scoped product catalogs
    Claim_TE_Repository,
    Claim_TEService,
    ProductFamily_TE_Repository,
    ProductFamily_TEService,
    CommercialLine_TE_Repository,
    CommercialLine_TEService
  ]
})
export class ProductsModule {}
