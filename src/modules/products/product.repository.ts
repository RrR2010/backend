import { Injectable } from '@nestjs/common'
import { Prisma, ProductStatus } from '@prisma/client'
import { PrismaService } from '@shared/prisma/prisma.service'
import type { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'
import { ForbiddenException } from '@nestjs/common'
import { Id } from '@shared/value-objects'
import { Product_TE, type Product_TEProps, type CreateProduct_TEProps } from './product.entity'
import { SystemState } from '@shared/behaviours/lockable'
import type { Product_TE as PrismaProduct_TE } from '@prisma/client'

export abstract class ProductRepository {
  abstract findById(id: string, ctx: RequestContext): Promise<Product_TE | null>
  abstract findAll(filter: ProductFilter, ctx: RequestContext): Promise<Product_TE[]>
  abstract save(product: Product_TE, ctx: RequestContext): Promise<Product_TE>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

export type ProductFilter = {
  tenantId?: string
  status?: string
}

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, ctx: RequestContext): Promise<Product_TE | null> {
    const where: Prisma.Product_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) where.tenantId = effectiveTenantId
    const data = await this.prisma.product_TE.findUnique({ where })
    if (!data) return null
    if (data.systemState === 'DELETED') return null
    return PrismaProduct_TEMapper.toDomain(data)
  }

  async findAll(filter: ProductFilter, ctx: RequestContext): Promise<Product_TE[]> {
    const where: Prisma.Product_TEWhereInput = {}
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) where.tenantId = effectiveTenantId
    if (filter.status) where.status = filter.status as ProductStatus
    where.systemState = 'ACTIVE'
    const data = await this.prisma.product_TE.findMany({ where, orderBy: { internalName: 'asc' } })
    return data.map(PrismaProduct_TEMapper.toDomain)
  }

  async save(product: Product_TE, ctx: RequestContext): Promise<Product_TE> {
    if (ctx.scope === UserScope.TENANT && product.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    const id = product.id.value
    const data = PrismaProduct_TEMapper.toPersistence(product)
    await this.prisma.product_TE.upsert({ where: { id }, update: data, create: data })
    return product
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.Product_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) where.tenantId = effectiveTenantId
    await this.prisma.product_TE.update({
      where,
      data: { systemState: 'DELETED', updatedAt: new Date() },
    })
  }
}

class PrismaProduct_TEMapper {
  static toDomain(data: PrismaProduct_TE): Product_TE {
    const systemState =
      SystemState[data.systemState as keyof typeof SystemState]
    if (!systemState) {
      throw new Error(`Invalid systemState value: ${data.systemState}`)
    }
    return Product_TE.rehydrate({
      id: Id.from(data.id),
      tenantId: data.tenantId,
      internalName: data.internalName,
      code: data.code,
      externalCode: data.externalCode ?? null,
      displayName: data.displayName ?? null,
      status: data.status,
      commercialName: data.commercialName ?? null,
      saleDenomination: data.saleDenomination ?? null,
      productType: data.productType ?? null,
      notes: data.notes ?? null,
      barcodeGtin: data.barcodeGtin ?? null,
      packagingType: data.packagingType ?? null,
      batchCode: data.batchCode ?? null,
      declaredWeight: data.declaredWeight?.toNumber() ?? null,
      declaredVolume: data.declaredVolume?.toNumber() ?? null,
      shelfLifeDays: data.shelfLifeDays ?? null,
      storageConditions: data.storageConditions ?? null,
      productFamilyId: data.productFamilyId ?? null,
      commercialLineId: data.commercialLineId ?? null,
      systemState,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    })
  }

  static toPersistence(product: Product_TE): Prisma.Product_TEUncheckedCreateInput {
    return {
      id: product.id.value,
      tenantId: product.tenantId,
      internalName: product.internalName,
      code: product.code,
      externalCode: product.externalCode,
      displayName: product.displayName,
      status: product.status,
      commercialName: product.commercialName,
      saleDenomination: product.saleDenomination,
      productType: product.productType,
      notes: product.notes,
      barcodeGtin: product.barcodeGtin,
      packagingType: product.packagingType,
      batchCode: product.batchCode,
      declaredWeight: product.declaredWeight,
      declaredVolume: product.declaredVolume,
      shelfLifeDays: product.shelfLifeDays,
      storageConditions: product.storageConditions,
      productFamilyId: product.productFamilyId,
      commercialLineId: product.commercialLineId,
      systemState: product.systemState,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }
  }
}
