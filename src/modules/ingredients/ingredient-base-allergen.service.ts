import { Injectable } from '@nestjs/common'
import { IngredientBaseAllergenRepository } from '@ingredients/ingredient-base-allergen.repository'
import {
  IngredientBaseAllergen,
  CreateIngredientBaseAllergenProps
} from '@ingredients/ingredient-base-allergen.entity'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'

export type SaveBaseAllergenDiff = {
  baseAllergenId: string
  relationType: 'CONTAINS' | 'MAY_CONTAIN'
}

@Injectable()
export class IngredientBaseAllergenService {
  constructor(private readonly repository: IngredientBaseAllergenRepository) {}

  async create(
    props: CreateIngredientBaseAllergenProps,
    ctx: RequestContext
  ): Promise<IngredientBaseAllergen> {
    // TODO: zod validate input
    const tenantId =
      ctx.scope === UserScope.TENANT ? ctx.tenantId : props.tenantId
    const entry = IngredientBaseAllergen.create({ ...props, tenantId })
    return this.repository.create(entry, ctx)
  }

  async findByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<IngredientBaseAllergen[]> {
    return this.repository.findByIngredientId(ingredientId, ctx)
  }

  /**
   * Processes base allergen diffs: creates new entries and deletes removed ones.
   * All operations are performed via the repository (which is called within
   * a transaction managed by ingredient.service.ts saveAll()).
   */
  async saveDiff(
    ingredientId: string,
    diffs: { created: SaveBaseAllergenDiff[]; deleted: string[] },
    ctx: RequestContext
  ): Promise<void> {
    const tenantId = ctx.scope === UserScope.TENANT ? ctx.tenantId : ''

    // Delete removed entries
    if (diffs.deleted.length > 0) {
      for (const id of diffs.deleted) {
        await this.repository.delete(id, ctx)
      }
    }

    // Create new entries
    if (diffs.created.length > 0) {
      const entries = diffs.created.map((d) =>
        IngredientBaseAllergen.create({
          tenantId,
          ingredientId,
          baseAllergenId: d.baseAllergenId,
          relationType: d.relationType
        })
      )
      await this.repository.createMany(entries, ctx)
    }
  }

  async remove(id: string, ctx: RequestContext): Promise<void> {
    await this.repository.delete(id, ctx)
  }

  async removeAllForIngredient(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<void> {
    await this.repository.deleteManyByIngredientId(ingredientId, ctx)
  }
}
