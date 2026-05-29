import { Injectable, ForbiddenException } from '@nestjs/common'
import { IngredientBaseAllergenRepository } from '@ingredients/ingredient-base-allergen.repository'
import {
  IngredientBaseAllergen,
  CreateIngredientBaseAllergenProps
} from '@ingredients/ingredient-base-allergen.entity'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { SaveBaseAllergenDiff } from '@ingredients/ingredient.dto'

export { SaveBaseAllergenDiff }

@Injectable()
export class IngredientBaseAllergenService {
  constructor(private readonly repository: IngredientBaseAllergenRepository) {}

  async create(
    props: CreateIngredientBaseAllergenProps,
    ctx: RequestContext
  ): Promise<IngredientBaseAllergen> {
    // TODO: zod validate input
    if (ctx.scope !== UserScope.TENANT) {
      throw new ForbiddenException(
        'Only tenant-scoped users can manage ingredient base allergens'
      )
    }
    const entry = IngredientBaseAllergen.create({
      ...props,
      tenantId: ctx.tenantId
    })
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
   * This method does NOT manage the transaction itself — it expects the caller
   * to have already opened a Prisma transaction (e.g., within saveAll()).
   */
  async saveDiff(
    ingredientId: string,
    diffs: { created: SaveBaseAllergenDiff[]; deleted: string[] },
    ctx: RequestContext
  ): Promise<void> {
    if (ctx.scope !== UserScope.TENANT) {
      throw new ForbiddenException(
        'Only tenant-scoped users can manage ingredient base allergens'
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
    if (ctx.scope !== UserScope.TENANT) {
      throw new ForbiddenException(
        'Only tenant-scoped users can manage ingredient base allergens'
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
        'Only tenant-scoped users can manage ingredient base allergens'
      )
    }
    await this.repository.deleteManyByIngredientId(ingredientId, ctx)
  }
}
