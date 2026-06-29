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

// Wave 5 — Product sub-entities
import { ProductLabelField_TEController } from './product-label-field-te.controller'
import { ProductLabelField_TEService } from './product-label-field-te.service'
import {
  ProductLabelField_TE_Repository,
  PrismaProductLabelField_TE_Repository
} from './product-label-field-te.repository'
import { ProductPanel_TEController } from './product-panel-te.controller'
import { ProductPanel_TEService } from './product-panel-te.service'
import {
  ProductPanel_TE_Repository,
  PrismaProductPanel_TE_Repository
} from './product-panel-te.repository'
import { ProductNutrientOverride_TEController } from './product-nutrient-override-te.controller'
import { ProductNutrientOverride_TEService } from './product-nutrient-override-te.service'
import {
  ProductNutrientOverride_TE_Repository,
  PrismaProductNutrientOverride_TE_Repository
} from './product-nutrient-override-te.repository'
import { ProductClaim_TEController } from './product-claim-te.controller'
import { ProductClaim_TEService } from './product-claim-te.service'
import {
  ProductClaim_TE_Repository,
  PrismaProductClaim_TE_Repository
} from './product-claim-te.repository'

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
    CommercialLinesController,
    // Wave 5 — Product sub-entities
    ProductLabelField_TEController,
    ProductPanel_TEController,
    ProductNutrientOverride_TEController,
    ProductClaim_TEController
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
    },
    // Wave 5 — Product sub-entities
    ProductLabelField_TEService,
    PrismaProductLabelField_TE_Repository,
    {
      provide: ProductLabelField_TE_Repository,
      useExisting: PrismaProductLabelField_TE_Repository
    },
    ProductPanel_TEService,
    PrismaProductPanel_TE_Repository,
    {
      provide: ProductPanel_TE_Repository,
      useExisting: PrismaProductPanel_TE_Repository
    },
    ProductNutrientOverride_TEService,
    PrismaProductNutrientOverride_TE_Repository,
    {
      provide: ProductNutrientOverride_TE_Repository,
      useExisting: PrismaProductNutrientOverride_TE_Repository
    },
    ProductClaim_TEService,
    PrismaProductClaim_TE_Repository,
    {
      provide: ProductClaim_TE_Repository,
      useExisting: PrismaProductClaim_TE_Repository
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
    CommercialLine_TEService,
    // Wave 5 — Product sub-entities
    ProductLabelField_TE_Repository,
    ProductLabelField_TEService,
    ProductPanel_TE_Repository,
    ProductPanel_TEService,
    ProductNutrientOverride_TE_Repository,
    ProductNutrientOverride_TEService,
    ProductClaim_TE_Repository,
    ProductClaim_TEService
  ]
})
export class ProductsModule {}
