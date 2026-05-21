import { Injectable } from '@nestjs/common'
import { IngredientRepository, IngredientFilter } from '@ingredients/ingredient.repository'
import { Ingredient, CreateIngredientProps } from '@ingredients/ingredient.entity'
import { IngredientNotFoundError, IngredientAlreadyExistsError } from '@ingredients/ingredient.errors'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { Prisma } from '@prisma/client'

@Injectable()
export class IngredientService {
  constructor(private readonly repository: IngredientRepository) {}

  async create(props: CreateIngredientProps, ctx: RequestContext): Promise<Ingredient> {
    // TODO: zod validate input
    const tenantId = ctx.scope === UserScope.TENANT ? ctx.tenantId : props.tenantId
    const ingredient = Ingredient.create({ ...props, tenantId })
    try {
      return await this.repository.save(ingredient, ctx)
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002' &&
        (error.meta?.target as string[])?.includes('code')
      ) {
        throw new IngredientAlreadyExistsError(props.code, tenantId)
      }
      throw error
    }
  }

  async findAll(filter: IngredientFilter, ctx: RequestContext): Promise<Ingredient[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(id: string, ctx: RequestContext): Promise<Ingredient> {
    const ingredient = await this.repository.findById(id, ctx)
    if (!ingredient) {
      throw new IngredientNotFoundError(id)
    }
    return ingredient
  }

  async save(ingredient: Ingredient, ctx: RequestContext): Promise<Ingredient> {
    return this.repository.save(ingredient, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const ingredient = await this.findById(id, ctx)
    ingredient.delete()
    await this.repository.save(ingredient, ctx)
  }

  async activate(id: string, ctx: RequestContext): Promise<Ingredient> {
    const ingredient = await this.findById(id, ctx)
    ingredient.activate()
    return this.repository.save(ingredient, ctx)
  }

  async lock(id: string, ctx: RequestContext): Promise<Ingredient> {
    const ingredient = await this.findById(id, ctx)
    ingredient.lock()
    return this.repository.save(ingredient, ctx)
  }
}
