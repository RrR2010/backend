import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '@shared/prisma/prisma.service'
import type { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'
import { ForbiddenException } from '@nestjs/common'
import { Id } from '@shared/value-objects'
import { Product, type ProductProps, type CreateProductProps } from './product.entity'

export abstract class ProductRepository {
  abstract findById(id: string, ctx: RequestContext): Promise<Product | null>
  abstract findAll(filter: ProductFilter, ctx: RequestContext): Promise<Product[]>
  abstract save(product: Product, ctx: RequestContext): Promise<Product>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

export type ProductFilter = {
  tenantId?: string
  status?: string
}

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, ctx: RequestContext): Promise<Product | null> {
    const where: Prisma.ProductWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) where.tenantId = effectiveTenantId
    const data = await this.prisma.product.findUnique({ where })
    if (!data) return null
    if (data.systemState === 'DELETED') return null
    return PrismaProductMapper.toDomain(data)
  }

  async findAll(filter: ProductFilter, ctx: RequestContext): Promise<Product[]> {
    const where: Prisma.ProductWhereInput = {}
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) where.tenantId = effectiveTenantId
    if (filter.status) where.status = filter.status as any
    where.systemState = 'ACTIVE'
    const data = await this.prisma.product.findMany({ where, orderBy: { name: 'asc' } })
    return data.map(PrismaProductMapper.toDomain)
  }

  async save(product: Product, ctx: RequestContext): Promise<Product> {
    if (ctx.scope === UserScope.TENANT && product.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    const id = product.id.value
    const data = PrismaProductMapper.toPersistence(product)
    await this.prisma.product.upsert({ where: { id }, update: data, create: data })
    return product
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.ProductWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) where.tenantId = effectiveTenantId
    await this.prisma.product.update({
      where,
      data: { systemState: 'DELETED', updatedAt: new Date() },
    })
  }
}

class PrismaProductMapper {
  static toDomain(data: any): Product {
    return Product.rehydrate({
      id: Id.from(data.id),
      tenantId: data.tenantId,
      name: data.name,
      code: data.code,
      status: data.status,
      commercialName: data.commercialName ?? null,
      denomination: data.denomination ?? null,
      productType: data.productType ?? null,
      notes: data.notes ?? null,
      barcodeGtin: data.barcodeGtin ?? null,
      declaredWeight: data.declaredWeight ? Number(data.declaredWeight) : null,
      declaredVolume: data.declaredVolume ? Number(data.declaredVolume) : null,
      shelfLifeDays: data.shelfLifeDays ?? null,
      storageConditions: data.storageConditions ?? null,
      systemState: data.systemState,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    })
  }

  static toPersistence(product: Product): Prisma.ProductUncheckedCreateInput {
    return {
      id: product.id.value,
      tenantId: product.tenantId,
      name: product.name,
      code: product.code,
      status: product.status,
      commercialName: product.commercialName,
      denomination: product.denomination,
      productType: product.productType,
      notes: product.notes,
      barcodeGtin: product.barcodeGtin,
      declaredWeight: product.declaredWeight,
      declaredVolume: product.declaredVolume,
      shelfLifeDays: product.shelfLifeDays,
      storageConditions: product.storageConditions,
      systemState: product.systemState,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }
  }
}
