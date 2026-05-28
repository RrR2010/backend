import { Injectable } from '@nestjs/common'
import { IngredientNutrientRepository } from '@ingredients/ingredient-nutrient.repository'
import {
  IngredientNutrient,
  CreateIngredientNutrientProps
} from '@ingredients/ingredient-nutrient.entity'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'

@Injectable()
export class IngredientNutrientService {
  constructor(private readonly repository: IngredientNutrientRepository) {}

  async create(
    props: CreateIngredientNutrientProps,
    ctx: RequestContext
  ): Promise<IngredientNutrient> {
    // TODO: zod validate input
    const tenantId =
      ctx.scope === UserScope.TENANT ? ctx.tenantId : props.tenantId
    const entry = IngredientNutrient.create({ ...props, tenantId })
    return this.repository.add(entry, ctx)
  }

  async findByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<IngredientNutrient[]> {
    return this.repository.findByIngredientId(ingredientId, ctx)
  }

  async remove(id: string, ctx: RequestContext): Promise<void> {
    await this.repository.remove(id, ctx)
  }

  async removeAllForIngredient(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<void> {
    await this.repository.removeAllForIngredient(ingredientId, ctx)
  }
}
