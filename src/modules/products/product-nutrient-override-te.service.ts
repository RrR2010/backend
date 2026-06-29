import { Injectable, InternalServerErrorException } from '@nestjs/common'
import {
  ProductNutrientOverride_TE_Repository,
  ProductNutrientOverride_TEFilter
} from '@products/product-nutrient-override-te.repository'
import {
  ProductNutrientOverride_TE,
  CreateProductNutrientOverride_TEProps
} from '@products/product-nutrient-override-te.entity'
import { ProductNutrientOverride_TENotFoundError } from '@products/product-nutrient-override-te.errors'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

@Injectable()
export class ProductNutrientOverride_TEService {
  constructor(
    private readonly repository: ProductNutrientOverride_TE_Repository
  ) {}

  async create(
    props: CreateProductNutrientOverride_TEProps,
    ctx: RequestContext
  ): Promise<ProductNutrientOverride_TE> {
    // TODO: zod validate input
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (!effectiveTenantId) throw new InternalServerErrorException('tenantId is required')
    const tenantId =
      ctx.scope === UserScope.TENANT
        ? ctx.tenantId
        : props.tenantId || effectiveTenantId
    const entity = ProductNutrientOverride_TE.create({ ...props, tenantId })
    return await this.repository.save(entity, ctx)
  }

  async findAll(
    filter: ProductNutrientOverride_TEFilter,
    ctx: RequestContext
  ): Promise<ProductNutrientOverride_TE[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<ProductNutrientOverride_TE> {
    const entity = await this.repository.findById(id, ctx)
    if (!entity) {
      throw new ProductNutrientOverride_TENotFoundError(id)
    }
    return entity
  }

  async findByProduct(
    productId: string,
    ctx: RequestContext
  ): Promise<ProductNutrientOverride_TE[]> {
    return this.repository.findByProduct(productId, ctx)
  }

  async save(
    entity: ProductNutrientOverride_TE,
    ctx: RequestContext
  ): Promise<ProductNutrientOverride_TE> {
    return this.repository.save(entity, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const entity = await this.findById(id, ctx)
    await this.repository.delete(entity.id.value, ctx)
  }
}
