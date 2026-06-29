import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { IngredientAllergen_TE_Repository } from '@ingredients/ingredient-allergen-te.repository'
import {
  IngredientAllergen_TE,
  CreateIngredientAllergen_TEProps
} from '@ingredients/ingredient-allergen-te.entity'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

@Injectable()
export class IngredientAllergen_TEService {
  constructor(
    private readonly repository: IngredientAllergen_TE_Repository
  ) {}

  async create(
    props: CreateIngredientAllergen_TEProps,
    ctx: RequestContext
  ): Promise<IngredientAllergen_TE> {
    // TODO: zod validate input
    const effectiveTenantId = getEffectiveTenantId(ctx)
    const tenantId =
      ctx.scope === UserScope.TENANT
        ? ctx.tenantId
        : (effectiveTenantId ?? props.tenantId)
    if (!tenantId) throw new InternalServerErrorException('tenantId is required')
    const entry = IngredientAllergen_TE.create({ ...props, tenantId })
    return this.repository.create(entry, ctx)
  }

  async findByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<IngredientAllergen_TE[]> {
    return this.repository.findByIngredientId(ingredientId, ctx)
  }

  async remove(id: string, ctx: RequestContext): Promise<void> {
    try {
      await this.repository.remove(id, ctx)
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Resource not found or access denied')
      }
      throw error
    }
  }

  async removeAllForIngredient(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<void> {
    await this.repository.removeAllForIngredient(ingredientId, ctx)
  }
}
