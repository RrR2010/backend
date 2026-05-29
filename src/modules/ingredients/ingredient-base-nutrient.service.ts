import { Injectable } from '@nestjs/common'
import { IngredientBaseNutrientRepository } from '@ingredients/ingredient-base-nutrient.repository'
import {
  IngredientBaseNutrient,
  CreateIngredientBaseNutrientProps
} from '@ingredients/ingredient-base-nutrient.entity'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'

export type SaveBaseNutrientDiff = {
  baseNutrientId: string
  value: number | null
}

@Injectable()
export class IngredientBaseNutrientService {
  constructor(private readonly repository: IngredientBaseNutrientRepository) {}

  async create(
    props: CreateIngredientBaseNutrientProps,
    ctx: RequestContext
  ): Promise<IngredientBaseNutrient> {
    // TODO: zod validate input
    const tenantId =
      ctx.scope === UserScope.TENANT ? ctx.tenantId : props.tenantId
    const entry = IngredientBaseNutrient.create({ ...props, tenantId })
    return this.repository.create(entry, ctx)
  }

  async findByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<IngredientBaseNutrient[]> {
    return this.repository.findByIngredientId(ingredientId, ctx)
  }

  /**
   * Processes base nutrient diffs: creates new entries and deletes removed ones.
   * All operations are performed via the repository (which is called within
   * a transaction managed by ingredient.service.ts saveAll()).
   */
  async saveDiff(
    ingredientId: string,
    diffs: { created: SaveBaseNutrientDiff[]; deleted: string[] },
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
        IngredientBaseNutrient.create({
          tenantId,
          ingredientId,
          baseNutrientId: d.baseNutrientId,
          value: d.value
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
