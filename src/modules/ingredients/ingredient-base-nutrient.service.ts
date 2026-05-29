import { Injectable, ForbiddenException } from '@nestjs/common'
import { IngredientBaseNutrientRepository } from '@ingredients/ingredient-base-nutrient.repository'
import {
  IngredientBaseNutrient,
  CreateIngredientBaseNutrientProps
} from '@ingredients/ingredient-base-nutrient.entity'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { SaveBaseNutrientDiff } from '@ingredients/ingredient.dto'

export { SaveBaseNutrientDiff }

@Injectable()
export class IngredientBaseNutrientService {
  constructor(private readonly repository: IngredientBaseNutrientRepository) {}

  async create(
    props: CreateIngredientBaseNutrientProps,
    ctx: RequestContext
  ): Promise<IngredientBaseNutrient> {
    // TODO: zod validate input
    if (ctx.scope !== UserScope.TENANT) {
      throw new ForbiddenException(
        'Only tenant-scoped users can manage ingredient base nutrients'
      )
    }
    const entry = IngredientBaseNutrient.create({
      ...props,
      tenantId: ctx.tenantId
    })
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
   * This method does NOT manage the transaction itself — it expects the caller
   * to have already opened a Prisma transaction (e.g., within saveAll()).
   */
  async saveDiff(
    ingredientId: string,
    diffs: { created: SaveBaseNutrientDiff[]; deleted: string[] },
    ctx: RequestContext
  ): Promise<void> {
    if (ctx.scope !== UserScope.TENANT) {
      throw new ForbiddenException(
        'Only tenant-scoped users can manage ingredient base nutrients'
      )
    }
    const tenantId = ctx.tenantId

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
          value:
            d.value !== null && d.value !== undefined
              ? parseFloat(d.value)
              : null
        })
      )
      await this.repository.createMany(entries, ctx)
    }
  }

  async remove(id: string, ctx: RequestContext): Promise<void> {
    if (ctx.scope !== UserScope.TENANT) {
      throw new ForbiddenException(
        'Only tenant-scoped users can manage ingredient base nutrients'
      )
    }
    await this.repository.delete(id, ctx)
  }

  async removeAllForIngredient(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<void> {
    if (ctx.scope !== UserScope.TENANT) {
      throw new ForbiddenException(
        'Only tenant-scoped users can manage ingredient base nutrients'
      )
    }
    await this.repository.deleteManyByIngredientId(ingredientId, ctx)
  }
}
