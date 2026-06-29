import { Injectable, InternalServerErrorException } from '@nestjs/common'
import {
  IngredientFlag_TE_Repository,
  IngredientFlagFilter
} from '@ingredients/ingredient-flag-te.repository'
import {
  IngredientFlag_TE,
  CreateIngredientFlag_TEProps
} from '@ingredients/ingredient-flag-te.entity'
import { IngredientFlag_TENotFoundError } from '@ingredients/ingredient-flag-te.errors'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

@Injectable()
export class IngredientFlag_TEService {
  constructor(
    private readonly repository: IngredientFlag_TE_Repository
  ) {}

  async create(
    props: CreateIngredientFlag_TEProps,
    ctx: RequestContext
  ): Promise<IngredientFlag_TE> {
    // TODO: zod validate input
    const effectiveTenantId = getEffectiveTenantId(ctx)
    const tenantId =
      ctx.scope === UserScope.TENANT
        ? ctx.tenantId
        : (effectiveTenantId ?? props.tenantId)
    if (!tenantId) throw new InternalServerErrorException('tenantId is required')
    const entry = IngredientFlag_TE.create({ ...props, tenantId })
    return this.repository.save(entry, ctx)
  }

  async findAll(
    filter: IngredientFlagFilter,
    ctx: RequestContext
  ): Promise<IngredientFlag_TE[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<IngredientFlag_TE> {
    const entry = await this.repository.findById(id, ctx)
    if (!entry) {
      throw new IngredientFlag_TENotFoundError(id)
    }
    return entry
  }

  async findByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<IngredientFlag_TE[]> {
    return this.repository.findByIngredientId(ingredientId, ctx)
  }

  async save(
    entry: IngredientFlag_TE,
    ctx: RequestContext
  ): Promise<IngredientFlag_TE> {
    return this.repository.save(entry, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const entry = await this.findById(id, ctx)
    entry.delete()
    await this.repository.save(entry, ctx)
  }

  async activate(
    id: string,
    ctx: RequestContext
  ): Promise<IngredientFlag_TE> {
    const entry = await this.findById(id, ctx)
    entry.activate()
    return this.repository.save(entry, ctx)
  }

  async lock(id: string, ctx: RequestContext): Promise<IngredientFlag_TE> {
    const entry = await this.findById(id, ctx)
    entry.lock()
    return this.repository.save(entry, ctx)
  }

  async unlock(id: string, ctx: RequestContext): Promise<IngredientFlag_TE> {
    const entry = await this.findById(id, ctx)
    entry.unlock()
    return this.repository.save(entry, ctx)
  }
}
