import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '@shared/prisma/prisma.service'
import {
  IngredientTechnicalProfileRepository,
  IngredientTechnicalProfileFilter
} from '@ingredients/ingredient-technical-profile.repository'
import {
  IngredientTechnicalProfile,
  CreateIngredientTechnicalProfileProps
} from '@ingredients/ingredient-technical-profile.entity'
import {
  IngredientTechnicalProfileNotFoundError,
  IngredientTechnicalProfileAlreadyExistsError
} from '@ingredients/ingredient-technical-profile.errors'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'

@Injectable()
export class IngredientTechnicalProfileService {
  constructor(
    private readonly repository: IngredientTechnicalProfileRepository,
    private readonly prisma: PrismaService
  ) {}

  async create(
    props: CreateIngredientTechnicalProfileProps,
    ctx: RequestContext
  ): Promise<IngredientTechnicalProfile> {
    // TODO: zod validate input
    const tenantId =
      ctx.scope === UserScope.TENANT ? ctx.tenantId : props.tenantId
    const profile = IngredientTechnicalProfile.create({ ...props, tenantId })
    try {
      return await this.repository.save(profile, ctx)
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new IngredientTechnicalProfileAlreadyExistsError(
          props.ingredientId,
          tenantId
        )
      }
      throw error
    }
  }

  async findAll(
    filter: IngredientTechnicalProfileFilter,
    ctx: RequestContext
  ): Promise<IngredientTechnicalProfile[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<IngredientTechnicalProfile> {
    const profile = await this.repository.findById(id, ctx)
    if (!profile) {
      throw new IngredientTechnicalProfileNotFoundError(id)
    }
    return profile
  }

  async findByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<IngredientTechnicalProfile> {
    let profile = await this.repository.findByIngredientId(ingredientId, ctx)
    if (!profile) {
      // Auto-create empty profile on first read
      let tenantId: string
      if (ctx.scope === UserScope.TENANT) {
        tenantId = ctx.tenantId
      } else {
        const ingredient = await this.prisma.ingredient.findUnique({
          where: { id: ingredientId }
        })
        if (!ingredient) throw new NotFoundException('Ingredient not found')
        tenantId = ingredient.tenantId
      }

      profile = IngredientTechnicalProfile.create({
        ingredientId,
        tenantId,
        pac: null,
        pod: null,
        totalSolids: null,
        ashContent: null
      })
      profile = await this.repository.save(profile, ctx)
    }
    return profile
  }

  async save(
    profile: IngredientTechnicalProfile,
    ctx: RequestContext
  ): Promise<IngredientTechnicalProfile> {
    return this.repository.save(profile, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const profile = await this.findById(id, ctx)
    profile.delete()
    await this.repository.save(profile, ctx)
  }

  async activate(
    id: string,
    ctx: RequestContext
  ): Promise<IngredientTechnicalProfile> {
    const profile = await this.findById(id, ctx)
    profile.activate()
    return this.repository.save(profile, ctx)
  }

  async lock(
    id: string,
    ctx: RequestContext
  ): Promise<IngredientTechnicalProfile> {
    const profile = await this.findById(id, ctx)
    profile.lock()
    return this.repository.save(profile, ctx)
  }

  async unlock(
    id: string,
    ctx: RequestContext
  ): Promise<IngredientTechnicalProfile> {
    const entity = await this.findById(id, ctx)
    entity.unlock()
    return this.repository.save(entity, ctx)
  }
}
