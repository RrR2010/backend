import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { IngredientNutrient_TE_Repository } from '@ingredients/ingredient-nutrient-te.repository'
import {
  IngredientNutrient_TE,
  CreateIngredientNutrient_TEProps
} from '@ingredients/ingredient-nutrient-te.entity'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

@Injectable()
export class IngredientNutrient_TEService {
  constructor(
    private readonly repository: IngredientNutrient_TE_Repository
  ) {}

  async create(
    props: CreateIngredientNutrient_TEProps,
    ctx: RequestContext
  ): Promise<IngredientNutrient_TE> {
    // TODO: zod validate input
    const effectiveTenantId = getEffectiveTenantId(ctx)
    const tenantId =
      ctx.scope === UserScope.TENANT
        ? ctx.tenantId
        : (effectiveTenantId ?? props.tenantId)
    if (!tenantId) throw new InternalServerErrorException('tenantId is required')
    const entry = IngredientNutrient_TE.create({ ...props, tenantId })
    return this.repository.create(entry, ctx)
  }

  async findByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<IngredientNutrient_TE[]> {
    return this.repository.findByIngredientId(ingredientId, ctx)
  }

  async findByNutrientId(
    nutrientId: string,
    ctx: RequestContext
  ): Promise<IngredientNutrient_TE[]> {
    return this.repository.findByNutrientId(nutrientId, ctx)
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
