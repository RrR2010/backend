import { Injectable } from '@nestjs/common'
import { IngredientTenantAllergenRepository } from '@ingredients/ingredient-tenant-allergen.repository'
import {
  IngredientTenantAllergen,
  CreateIngredientTenantAllergenProps
} from '@ingredients/ingredient-tenant-allergen.entity'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'

@Injectable()
export class IngredientTenantAllergenService {
  constructor(
    private readonly repository: IngredientTenantAllergenRepository
  ) {}

  async create(
    props: CreateIngredientTenantAllergenProps,
    ctx: RequestContext
  ): Promise<IngredientTenantAllergen> {
    // TODO: zod validate input
    const tenantId =
      ctx.scope === UserScope.TENANT ? ctx.tenantId : props.tenantId
    const entry = IngredientTenantAllergen.create({ ...props, tenantId })
    return this.repository.add(entry, ctx)
  }

  async findByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<IngredientTenantAllergen[]> {
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
