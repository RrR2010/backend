import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { IngredientTenantNutrientRepository } from '@ingredients/ingredient-tenant-nutrient.repository'
import {
  IngredientTenantNutrient,
  CreateIngredientTenantNutrientProps
} from '@ingredients/ingredient-tenant-nutrient.entity'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

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
    const effectiveTenantId = getEffectiveTenantId(ctx) ?? ''
    const tenantId =
      ctx.scope === UserScope.TENANT
        ? ctx.tenantId
        : (props.tenantId || effectiveTenantId)
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
