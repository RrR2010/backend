import { Injectable, InternalServerErrorException } from '@nestjs/common'
import {
  IngredientCost_TE_Repository,
  IngredientCostFilter
} from '@ingredients/ingredient-cost-te.repository'
import {
  IngredientCost_TE,
  CreateIngredientCost_TEProps
} from '@ingredients/ingredient-cost-te.entity'
import { IngredientCost_TENotFoundError } from '@ingredients/ingredient-cost-te.errors'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

@Injectable()
export class IngredientCost_TEService {
  constructor(private readonly repository: IngredientCost_TE_Repository) {}

  async create(
    props: CreateIngredientCost_TEProps,
    ctx: RequestContext
  ): Promise<IngredientCost_TE> {
    // TODO: zod validate input
    const effectiveTenantId = getEffectiveTenantId(ctx)
    const tenantId =
      ctx.scope === UserScope.TENANT
        ? ctx.tenantId
        : (effectiveTenantId ?? props.tenantId)
    if (!tenantId) throw new InternalServerErrorException('tenantId is required')
    const entity = IngredientCost_TE.create({ ...props, tenantId })
    return this.repository.save(entity, ctx)
  }

  async findAll(
    filter: IngredientCostFilter,
    ctx: RequestContext
  ): Promise<IngredientCost_TE[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<IngredientCost_TE[]> {
    return this.repository.findByIngredientId(ingredientId, ctx)
  }

  async findById(id: string, ctx: RequestContext): Promise<IngredientCost_TE> {
    const entity = await this.repository.findById(id, ctx)
    if (!entity) {
      throw new IngredientCost_TENotFoundError(id)
    }
    return entity
  }

  async save(
    entity: IngredientCost_TE,
    ctx: RequestContext
  ): Promise<IngredientCost_TE> {
    return this.repository.save(entity, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const entity = await this.findById(id, ctx)
    entity.delete()
    await this.repository.save(entity, ctx)
  }

  async activate(id: string, ctx: RequestContext): Promise<IngredientCost_TE> {
    const entity = await this.findById(id, ctx)
    entity.activate()
    return this.repository.save(entity, ctx)
  }

  async lock(id: string, ctx: RequestContext): Promise<IngredientCost_TE> {
    const entity = await this.findById(id, ctx)
    entity.lock()
    return this.repository.save(entity, ctx)
  }

  async unlock(id: string, ctx: RequestContext): Promise<IngredientCost_TE> {
    const entity = await this.findById(id, ctx)
    entity.unlock()
    return this.repository.save(entity, ctx)
  }
}
