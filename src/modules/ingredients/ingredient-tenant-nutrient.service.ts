import { Injectable } from '@nestjs/common'
import { IngredientTenantNutrientRepository } from '@ingredients/ingredient-tenant-nutrient.repository'
import {
  IngredientTenantNutrient,
  CreateIngredientTenantNutrientProps
} from '@ingredients/ingredient-tenant-nutrient.entity'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'

@Injectable()
export class IngredientTenantNutrientService {
  constructor(
    private readonly repository: IngredientTenantNutrientRepository
  ) {}

  async create(
    props: CreateIngredientTenantNutrientProps,
    ctx: RequestContext
  ): Promise<IngredientTenantNutrient> {
    // TODO: zod validate input
    const tenantId =
      ctx.scope === UserScope.TENANT ? ctx.tenantId : props.tenantId
    const entry = IngredientTenantNutrient.create({ ...props, tenantId })
    return this.repository.add(entry, ctx)
  }

  async findByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<IngredientTenantNutrient[]> {
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
