import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { IngredientTenantAllergenRepository } from '@ingredients/ingredient-tenant-allergen.repository'
import {
  IngredientTenantAllergen,
  CreateIngredientTenantAllergenProps
} from '@ingredients/ingredient-tenant-allergen.entity'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

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
    const effectiveTenantId = getEffectiveTenantId(ctx) ?? ''
    const tenantId =
      ctx.scope === UserScope.TENANT
        ? ctx.tenantId
        : (props.tenantId || effectiveTenantId)
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
