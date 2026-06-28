import { Module } from '@nestjs/common'
import { PrismaModule } from '@shared/prisma/prisma.module'
import { AuditLogModule } from '@audit-logs/audit-log.module'
import { ProductsController } from './product.controller'
import { ProductService } from './product.service'
import { PrismaProductRepository, ProductRepository } from './product.repository'
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

@Module({
  imports: [PrismaModule, AuditLogModule],
  controllers: [
    ProductsController,
    LabelField_PLController,
    ProductCategory_PLController,
    ProductSubcategory_PLController,
    PanelGeometricFormatType_PLController
  ],
  providers: [
    ProductService,
    PrismaProductRepository,
    { provide: ProductRepository, useExisting: PrismaProductRepository },
    LabelField_PLService,
    PrismaLabelField_PLRepository,
    { provide: LabelField_PLRepository, useExisting: PrismaLabelField_PLRepository },
    ProductCategory_PLService,
    PrismaProductCategory_PLRepository,
    { provide: ProductCategory_PLRepository, useExisting: PrismaProductCategory_PLRepository },
    ProductSubcategory_PLService,
    PrismaProductSubcategory_PLRepository,
    { provide: ProductSubcategory_PLRepository, useExisting: PrismaProductSubcategory_PLRepository },
    PanelGeometricFormatType_PLService,
    PrismaPanelGeometricFormatType_PLRepository,
    {
      provide: PanelGeometricFormatType_PLRepository,
      useExisting: PrismaPanelGeometricFormatType_PLRepository
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
    PanelGeometricFormatType_PLService
  ]
})
export class ProductsModule {}
