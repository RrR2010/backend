import { Injectable, InternalServerErrorException } from '@nestjs/common'
import {
  ProductLabelField_TE_Repository,
  ProductLabelField_TEFilter
} from '@products/product-label-field-te.repository'
import {
  ProductLabelField_TE,
  CreateProductLabelField_TEProps
} from '@products/product-label-field-te.entity'
import { ProductLabelField_TENotFoundError } from '@products/product-label-field-te.errors'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

@Injectable()
export class ProductLabelField_TEService {
  constructor(
    private readonly repository: ProductLabelField_TE_Repository
  ) {}

  async create(
    props: CreateProductLabelField_TEProps,
    ctx: RequestContext
  ): Promise<ProductLabelField_TE> {
    // TODO: zod validate input
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (!effectiveTenantId) throw new InternalServerErrorException('tenantId is required')
    const tenantId =
      ctx.scope === UserScope.TENANT
        ? ctx.tenantId
        : props.tenantId || effectiveTenantId
    const entity = ProductLabelField_TE.create({ ...props, tenantId })
    return await this.repository.save(entity, ctx)
  }

  async findAll(
    filter: ProductLabelField_TEFilter,
    ctx: RequestContext
  ): Promise<ProductLabelField_TE[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<ProductLabelField_TE> {
    const entity = await this.repository.findById(id, ctx)
    if (!entity) {
      throw new ProductLabelField_TENotFoundError(id)
    }
    return entity
  }

  async findByProduct(
    productId: string,
    ctx: RequestContext
  ): Promise<ProductLabelField_TE[]> {
    return this.repository.findByProduct(productId, ctx)
  }

  async save(
    entity: ProductLabelField_TE,
    ctx: RequestContext
  ): Promise<ProductLabelField_TE> {
    return this.repository.save(entity, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const entity = await this.findById(id, ctx)
    await this.repository.delete(entity.id.value, ctx)
  }
}
