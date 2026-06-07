import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '@shared/prisma/prisma.service'
import {
  IngredientLabelingProfileRepository,
  IngredientLabelingProfileFilter
} from '@ingredients/ingredient-labeling-profile.repository'
import {
  IngredientLabelingProfile,
  CreateIngredientLabelingProfileProps
} from '@ingredients/ingredient-labeling-profile.entity'
import {
  IngredientLabelingProfileNotFoundError,
  IngredientLabelingProfileAlreadyExistsError
} from '@ingredients/ingredient-labeling-profile.errors'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

@Injectable()
export class IngredientLabelingProfileService {
  constructor(
    private readonly repository: IngredientLabelingProfileRepository,
    private readonly prisma: PrismaService
  ) {}

  async create(
    props: CreateIngredientLabelingProfileProps,
    ctx: RequestContext
  ): Promise<IngredientLabelingProfile> {
    // TODO: zod validate input
    const effectiveTenantId = getEffectiveTenantId(ctx) ?? ''
    const tenantId =
      ctx.scope === UserScope.TENANT
        ? ctx.tenantId
        : (props.tenantId || effectiveTenantId)
    const profile = IngredientLabelingProfile.create({ ...props, tenantId })
    try {
      return await this.repository.save(profile, ctx)
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new IngredientLabelingProfileAlreadyExistsError(
            props.ingredientId,
            tenantId
          )
      }
      throw error
    }
  }

  async findAll(
    filter: IngredientLabelingProfileFilter,
    ctx: RequestContext
  ): Promise<IngredientLabelingProfile[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<IngredientLabelingProfile> {
    const profile = await this.repository.findById(id, ctx)
    if (!profile) {
      throw new IngredientLabelingProfileNotFoundError(id)
    }
    return profile
  }

  async findByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<IngredientLabelingProfile> {
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

      profile = IngredientLabelingProfile.create({
        ingredientId,
        tenantId,
        containsAddedSugars: false,
        containsIngredientWithAddedSugars: false,
        containsNaturallyOccurringSugarSubstitutes: false,
        usesProcessingThatIncreasesSugars: false,
        containsAddedFatsOrOils: false,
        containsButterOrMargarine: false,
        containsDairyCream: false,
        containsIngredientsWithFatsOrCream: false
      })
      profile = await this.repository.save(profile, ctx)
    }
    return profile
  }

  async save(
    profile: IngredientLabelingProfile,
    ctx: RequestContext
  ): Promise<IngredientLabelingProfile> {
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
  ): Promise<IngredientLabelingProfile> {
    const profile = await this.findById(id, ctx)
    profile.activate()
    return this.repository.save(profile, ctx)
  }

  async lock(
    id: string,
    ctx: RequestContext
  ): Promise<IngredientLabelingProfile> {
    const profile = await this.findById(id, ctx)
    profile.lock()
    return this.repository.save(profile, ctx)
  }

  async unlock(
    id: string,
    ctx: RequestContext
  ): Promise<IngredientLabelingProfile> {
    const entity = await this.findById(id, ctx)
    entity.unlock()
    return this.repository.save(entity, ctx)
  }
}
