import { Injectable, InternalServerErrorException } from '@nestjs/common'
import {
  ProductClaim_TE_Repository,
  ProductClaim_TEFilter
} from '@products/product-claim-te.repository'
import {
  ProductClaim_TE,
  CreateProductClaim_TEProps
} from '@products/product-claim-te.entity'
import { ProductClaim_TENotFoundError } from '@products/product-claim-te.errors'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

@Injectable()
export class ProductClaim_TEService {
  constructor(private readonly repository: ProductClaim_TE_Repository) {}

  async create(
    props: CreateProductClaim_TEProps,
    ctx: RequestContext
  ): Promise<ProductClaim_TE> {
    // TODO: zod validate input
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (!effectiveTenantId) throw new InternalServerErrorException('tenantId is required')
    const tenantId =
      ctx.scope === UserScope.TENANT
        ? ctx.tenantId
        : props.tenantId || effectiveTenantId
    const entity = ProductClaim_TE.create({ ...props, tenantId })
    return await this.repository.save(entity, ctx)
  }

  async findAll(
    filter: ProductClaim_TEFilter,
    ctx: RequestContext
  ): Promise<ProductClaim_TE[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(id: string, ctx: RequestContext): Promise<ProductClaim_TE> {
    const entity = await this.repository.findById(id, ctx)
    if (!entity) {
      throw new ProductClaim_TENotFoundError(id)
    }
    return entity
  }

  async findByProduct(
    productId: string,
    ctx: RequestContext
  ): Promise<ProductClaim_TE[]> {
    return this.repository.findByProduct(productId, ctx)
  }

  async save(
    entity: ProductClaim_TE,
    ctx: RequestContext
  ): Promise<ProductClaim_TE> {
    return this.repository.save(entity, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const entity = await this.findById(id, ctx)
    entity.delete()
    await this.repository.save(entity, ctx)
  }

  async activate(id: string, ctx: RequestContext): Promise<ProductClaim_TE> {
    const entity = await this.findById(id, ctx)
    entity.activate()
    return this.repository.save(entity, ctx)
  }

  async lock(id: string, ctx: RequestContext): Promise<ProductClaim_TE> {
    const entity = await this.findById(id, ctx)
    entity.lock()
    return this.repository.save(entity, ctx)
  }

  async unlock(id: string, ctx: RequestContext): Promise<ProductClaim_TE> {
    const entity = await this.findById(id, ctx)
    entity.unlock()
    return this.repository.save(entity, ctx)
  }
}
