import { Injectable } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { ProductCategory_PL } from '@products/product-category-pl.entity'
import { Id } from '@shared/value-objects'
import { SystemState } from '@shared/behaviours/lockable'
import {
  ProductCategory_PL as PrismaProductCategoryPL,
  Prisma
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'

// EXCEÇÃO: ProductCategory_PL é entidade platform-scoped (sem tenantId).
// Permanece acessível globalmente por usuários PLATFORM durante impersonação.
// Regra de Negócio #11 do EPIC_010.

export type ProductCategory_PLFilter = {
  code?: string
  systemState?: SystemState
}

export abstract class ProductCategory_PLRepository {
  abstract findById(
    id: string,
    _ctx: RequestContext
  ): Promise<ProductCategory_PL | null>
  abstract findAll(
    filter: ProductCategory_PLFilter,
    _ctx: RequestContext
  ): Promise<ProductCategory_PL[]>
  abstract save(
    category: ProductCategory_PL,
    _ctx: RequestContext
  ): Promise<ProductCategory_PL>
  abstract delete(id: string, _ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaProductCategory_PLRepository
  implements ProductCategory_PLRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    _ctx: RequestContext
  ): Promise<ProductCategory_PL | null> {
    // Platform-scoped resource — no tenantId
    const prismaCategoryPL =
      await this.prisma.productCategory_PL.findUnique({
        where: { id }
      })
    if (!prismaCategoryPL) return null
    if (prismaCategoryPL.systemState === 'DELETED') {
      return null
    }
    return PrismaProductCategory_PLMapper.toDomain(prismaCategoryPL)
  }

  async findAll(
    filter: ProductCategory_PLFilter,
    _ctx: RequestContext
  ): Promise<ProductCategory_PL[]> {
    // Platform-scoped resource — no tenantId
    const where: Prisma.ProductCategory_PLWhereInput = {}
    if (filter.code) {
      where.code = { contains: filter.code, mode: 'insensitive' }
    }
    if (filter.systemState) {
      where.systemState = filter.systemState
    }
    if (!filter.systemState) {
      where.systemState = { not: SystemState.DELETED }
    }
    const prismaCategoriesPL =
      await this.prisma.productCategory_PL.findMany({
        where,
        orderBy: { sequentialNumber: 'asc' }
      })
    return prismaCategoriesPL.map((cat) =>
      PrismaProductCategory_PLMapper.toDomain(cat)
    )
  }

  async save(
    category: ProductCategory_PL,
    _ctx: RequestContext
  ): Promise<ProductCategory_PL> {
    // Platform-scoped resource — no tenantId
    const id = category.id.value
    const data = PrismaProductCategory_PLMapper.toPersistence(category)
    await this.prisma.productCategory_PL.upsert({
      where: { id },
      update: data,
      create: data
    })
    return category
  }

  async delete(id: string, _ctx: RequestContext): Promise<void> {
    // Platform-scoped resource — no tenantId
    await this.prisma.productCategory_PL.update({
      where: { id },
      data: { systemState: SystemState.DELETED, updatedAt: new Date() }
    })
  }
}

class PrismaProductCategory_PLMapper {
  static toDomain(
    prismaCategoryPL: PrismaProductCategoryPL
  ): ProductCategory_PL {
    return ProductCategory_PL.rehydrate({
      id: Id.from(prismaCategoryPL.id),
      createdAt: prismaCategoryPL.createdAt,
      updatedAt: prismaCategoryPL.updatedAt,
      systemState:
        SystemState[
          prismaCategoryPL.systemState as keyof typeof SystemState
        ],
      code: prismaCategoryPL.code,
      name: prismaCategoryPL.name,
      description: prismaCategoryPL.description,
      sequentialNumber: prismaCategoryPL.sequentialNumber
    })
  }

  static toPersistence(
    category: ProductCategory_PL
  ): Prisma.ProductCategory_PLCreateInput {
    return {
      id: category.id.value,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      systemState: category.systemState,
      code: category.code,
      name: category.name,
      description: category.description,
      sequentialNumber: category.sequentialNumber
    }
  }
}
