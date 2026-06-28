import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { ProductFamily_TE } from '@products/product-family-te.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { Id } from '@shared/value-objects'
import {
  ProductFamily_TE as PrismaProductFamily_TE,
  Prisma
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

export type ProductFamily_TEFilter = {
  name?: string
  systemState?: SystemState
}

export abstract class ProductFamily_TE_Repository {
  abstract findById(
    id: string,
    ctx: RequestContext
  ): Promise<ProductFamily_TE | null>
  abstract findAll(
    filter: ProductFamily_TEFilter,
    ctx: RequestContext
  ): Promise<ProductFamily_TE[]>
  abstract save(
    family: ProductFamily_TE,
    ctx: RequestContext
  ): Promise<ProductFamily_TE>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaProductFamily_TE_Repository implements ProductFamily_TE_Repository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<ProductFamily_TE | null> {
    const where: Prisma.ProductFamily_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const prismaFamily = await this.prisma.productFamily_TE.findUnique({
      where
    })
    if (!prismaFamily) return null
    if (
      prismaFamily &&
      effectiveTenantId &&
      prismaFamily.systemState === SystemState.DELETED
    ) {
      return null
    }
    return PrismaProductFamily_TEMapper.toDomain(prismaFamily)
  }

  async findAll(
    filter: ProductFamily_TEFilter,
    ctx: RequestContext
  ): Promise<ProductFamily_TE[]> {
    const where: Prisma.ProductFamily_TEWhereInput = {
      ...(filter.name && {
        name: { contains: filter.name, mode: 'insensitive' }
      }),
      ...(filter.systemState && { systemState: filter.systemState })
    }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    if (effectiveTenantId) {
      where.systemState = { not: SystemState.DELETED }
    }
    const prismaFamilies = await this.prisma.productFamily_TE.findMany({
      where,
      orderBy: { name: 'asc' }
    })
    return prismaFamilies.map((family) =>
      PrismaProductFamily_TEMapper.toDomain(family)
    )
  }

  async save(
    family: ProductFamily_TE,
    ctx: RequestContext
  ): Promise<ProductFamily_TE> {
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId && family.tenantId !== effectiveTenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    const id = family.id.value
    const prismaFamily = PrismaProductFamily_TEMapper.toPersistence(family)
    await this.prisma.productFamily_TE.upsert({
      where: { id },
      update: prismaFamily,
      create: prismaFamily
    })
    return family
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.ProductFamily_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    await this.prisma.productFamily_TE.update({
      where,
      data: { systemState: SystemState.DELETED, updatedAt: new Date() }
    })
  }
}

class PrismaProductFamily_TEMapper {
  static toDomain(prismaFamily: PrismaProductFamily_TE): ProductFamily_TE {
    const systemState =
      SystemState[prismaFamily.systemState as keyof typeof SystemState]
    if (!systemState) {
      throw new Error(`Invalid systemState value: ${prismaFamily.systemState}`)
    }
    return ProductFamily_TE.rehydrate({
      id: Id.from(prismaFamily.id),
      createdAt: prismaFamily.createdAt,
      updatedAt: prismaFamily.updatedAt,
      systemState,
      tenantId: prismaFamily.tenantId,
      name: prismaFamily.name,
      description: prismaFamily.description
    })
  }

  static toPersistence(
    family: ProductFamily_TE
  ): Prisma.ProductFamily_TEUncheckedCreateInput {
    return {
      id: family.id.value,
      createdAt: family.createdAt,
      updatedAt: family.updatedAt,
      systemState: family.systemState,
      tenantId: family.tenantId,
      name: family.name,
      description: family.description
    }
  }
}
