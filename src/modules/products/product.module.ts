import { Module } from '@nestjs/common'
import { PrismaModule } from '@shared/prisma/prisma.module'
import { AuditLogModule } from '@audit-logs/audit-log.module'
import { ProductsController } from './product.controller'
import { ProductService } from './product.service'
import { PrismaProductRepository, ProductRepository } from './product.repository'

@Module({
  imports: [PrismaModule, AuditLogModule],
  controllers: [ProductsController],
  providers: [
    ProductService,
    PrismaProductRepository,
    { provide: ProductRepository, useExisting: PrismaProductRepository },
  ],
  exports: [ProductRepository, ProductService],
})
export class ProductsModule {}
