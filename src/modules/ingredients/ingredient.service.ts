import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException
} from '@nestjs/common'
import {
  IngredientRepository,
  IngredientFilter
} from '@ingredients/ingredient.repository'
import {
  Ingredient_TE,
  CreateIngredient_TEProps
} from '@ingredients/ingredient.entity'
import { IngredientNotFoundError } from '@ingredients/ingredient.errors'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

@Injectable()
export class IngredientService {
  constructor(
    private readonly repository: IngredientRepository
  ) {}

  async create(
    props: CreateIngredient_TEProps,
    ctx: RequestContext
  ): Promise<Ingredient_TE> {
    // TODO: zod validate input
    const effectiveTenantId = getEffectiveTenantId(ctx)
    const tenantId =
      ctx.scope === UserScope.TENANT
        ? ctx.tenantId
        : (effectiveTenantId ?? props.tenantId)
    if (!tenantId) throw new InternalServerErrorException('tenantId is required')
    const ingredient = Ingredient_TE.create({ ...props, tenantId })

    const saved = await this.repository.save(ingredient, ctx)

    return saved
  }

  async findAll(
    filter: IngredientFilter,
    ctx: RequestContext
  ): Promise<Ingredient_TE[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(id: string, ctx: RequestContext): Promise<Ingredient_TE> {
    const ingredient = await this.repository.findById(id, ctx)
    if (!ingredient) {
      throw new IngredientNotFoundError(id)
    }
    return ingredient
  }

  async save(ingredient: Ingredient_TE, ctx: RequestContext): Promise<Ingredient_TE> {
    return this.repository.save(ingredient, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const ingredient = await this.findById(id, ctx)
    ingredient.delete()
    await this.repository.save(ingredient, ctx)
  }

  async activate(id: string, ctx: RequestContext): Promise<Ingredient_TE> {
    const ingredient = await this.findById(id, ctx)
    ingredient.activate()
    return this.repository.save(ingredient, ctx)
  }

  async lock(id: string, ctx: RequestContext): Promise<Ingredient_TE> {
    const ingredient = await this.findById(id, ctx)
    ingredient.lock()
    return this.repository.save(ingredient, ctx)
  }

  async unlock(id: string, ctx: RequestContext): Promise<Ingredient_TE> {
    const ingredient = await this.findById(id, ctx)
    ingredient.unlock()
    return this.repository.save(ingredient, ctx)
  }

  /**
   * @deprecated Use individual _TE repository endpoints instead.
   * This method is kept for backwards compatibility but will throw.
   */
  async saveAll(
    _id: string,
    _dto: unknown,
    _ctx: RequestContext
  ): Promise<Ingredient_TE> {
    throw new Error(
      'saveAll is deprecated. Use individual _TE endpoints (IngredientAllergen_TE, IngredientNutrient_TE, etc.) instead.'
    )
  }
}
