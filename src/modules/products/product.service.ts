import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import type { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'
import { ProductRepository, type ProductFilter } from './product.repository'
import { Product, type CreateProductProps } from './product.entity'
import { ProductNotFoundError, ProductAlreadyExistsError } from './product.errors'

@Injectable()
export class ProductService {
  constructor(private readonly repository: ProductRepository) {}

  async create(props: CreateProductProps, ctx: RequestContext): Promise<Product> {
    const effectiveTenantId = getEffectiveTenantId(ctx) ?? ''
    const tenantId = ctx.scope === UserScope.TENANT ? ctx.tenantId : (props.tenantId || effectiveTenantId)
    const product = Product.create({ ...props, tenantId })
    try {
      return await this.repository.save(product, ctx)
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ProductAlreadyExistsError()
      }
      throw error
    }
  }

  async findAll(filter: ProductFilter, ctx: RequestContext): Promise<Product[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(id: string, ctx: RequestContext): Promise<Product> {
    const product = await this.repository.findById(id, ctx)
    if (!product) throw new ProductNotFoundError()
    return product
  }

  async update(id: string, props: Partial<CreateProductProps>, ctx: RequestContext): Promise<Product> {
    const product = await this.findById(id, ctx)
    if (props.name !== undefined) product.changeName(props.name)
    if (props.code !== undefined) product.changeCode(props.code)
    if (props.status !== undefined) product.changeStatus(props.status)
    try {
      return await this.repository.save(product, ctx)
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ProductAlreadyExistsError()
      }
      throw error
    }
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    await this.findById(id, ctx)
    await this.repository.delete(id, ctx)
  }
}
