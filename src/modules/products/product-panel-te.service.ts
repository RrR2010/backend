import { Injectable, InternalServerErrorException } from '@nestjs/common'
import {
  ProductPanel_TE_Repository,
  ProductPanel_TEFilter
} from '@products/product-panel-te.repository'
import {
  ProductPanel_TE,
  CreateProductPanel_TEProps
} from '@products/product-panel-te.entity'
import { ProductPanel_TENotFoundError } from '@products/product-panel-te.errors'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

@Injectable()
export class ProductPanel_TEService {
  constructor(private readonly repository: ProductPanel_TE_Repository) {}

  async create(
    props: CreateProductPanel_TEProps,
    ctx: RequestContext
  ): Promise<ProductPanel_TE> {
    // TODO: zod validate input
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (!effectiveTenantId) throw new InternalServerErrorException('tenantId is required')
    const tenantId =
      ctx.scope === UserScope.TENANT
        ? ctx.tenantId
        : props.tenantId || effectiveTenantId
    const entity = ProductPanel_TE.create({ ...props, tenantId })
    return await this.repository.save(entity, ctx)
  }

  async findAll(
    filter: ProductPanel_TEFilter,
    ctx: RequestContext
  ): Promise<ProductPanel_TE[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(id: string, ctx: RequestContext): Promise<ProductPanel_TE> {
    const entity = await this.repository.findById(id, ctx)
    if (!entity) {
      throw new ProductPanel_TENotFoundError(id)
    }
    return entity
  }

  async findByProduct(
    productId: string,
    ctx: RequestContext
  ): Promise<ProductPanel_TE[]> {
    return this.repository.findByProduct(productId, ctx)
  }

  async save(
    entity: ProductPanel_TE,
    ctx: RequestContext
  ): Promise<ProductPanel_TE> {
    return this.repository.save(entity, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const entity = await this.findById(id, ctx)
    entity.delete()
    await this.repository.save(entity, ctx)
  }

  async activate(id: string, ctx: RequestContext): Promise<ProductPanel_TE> {
    const entity = await this.findById(id, ctx)
    entity.activate()
    return this.repository.save(entity, ctx)
  }

  async lock(id: string, ctx: RequestContext): Promise<ProductPanel_TE> {
    const entity = await this.findById(id, ctx)
    entity.lock()
    return this.repository.save(entity, ctx)
  }

  async unlock(id: string, ctx: RequestContext): Promise<ProductPanel_TE> {
    const entity = await this.findById(id, ctx)
    entity.unlock()
    return this.repository.save(entity, ctx)
  }
}
