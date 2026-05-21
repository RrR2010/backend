import { Injectable } from '@nestjs/common'
import { IngredientAllergenRepository } from '@ingredients/ingredient-allergen.repository'
import { IngredientAllergen, CreateIngredientAllergenProps } from '@ingredients/ingredient-allergen.entity'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'

@Injectable()
export class IngredientAllergenService {
  constructor(private readonly repository: IngredientAllergenRepository) {}

  async create(props: CreateIngredientAllergenProps, ctx: RequestContext): Promise<IngredientAllergen> {
    // TODO: zod validate input
    const tenantId = ctx.scope === UserScope.TENANT ? ctx.tenantId : props.tenantId
    const entry = IngredientAllergen.create({ ...props, tenantId })
    return this.repository.add(entry, ctx)
  }

  async findByIngredientId(ingredientId: string, ctx: RequestContext): Promise<IngredientAllergen[]> {
    return this.repository.findByIngredientId(ingredientId, ctx)
  }

  async remove(id: string, ctx: RequestContext): Promise<void> {
    await this.repository.remove(id, ctx)
  }

  async removeAllForIngredient(ingredientId: string, ctx: RequestContext): Promise<void> {
    await this.repository.removeAllForIngredient(ingredientId, ctx)
  }
}
