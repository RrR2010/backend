import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '@shared/prisma/prisma.service'
import {
  IngredientRegulatoryProfileRepository,
  IngredientRegulatoryProfileFilter
} from '@ingredients/ingredient-regulatory-profile.repository'
import {
  IngredientRegulatoryProfile,
  CreateIngredientRegulatoryProfileProps
} from '@ingredients/ingredient-regulatory-profile.entity'
import {
  IngredientRegulatoryProfileNotFoundError,
  IngredientRegulatoryProfileAlreadyExistsError
} from '@ingredients/ingredient-regulatory-profile.errors'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

@Injectable()
export class IngredientRegulatoryProfileService {
  constructor(
    private readonly repository: IngredientRegulatoryProfileRepository,
    private readonly prisma: PrismaService
  ) {}

  async create(
    props: CreateIngredientRegulatoryProfileProps,
    ctx: RequestContext
  ): Promise<IngredientRegulatoryProfile> {
    // TODO: zod validate input
    const effectiveTenantId = getEffectiveTenantId(ctx) ?? ''
    const tenantId =
      ctx.scope === UserScope.TENANT
        ? ctx.tenantId
        : (props.tenantId || effectiveTenantId)
    const profile = IngredientRegulatoryProfile.create({ ...props, tenantId })
    try {
      return await this.repository.save(profile, ctx)
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new IngredientRegulatoryProfileAlreadyExistsError(
            props.ingredientId,
            tenantId
          )
      }
      throw error
    }
  }

  async findAll(
    filter: IngredientRegulatoryProfileFilter,
    ctx: RequestContext
  ): Promise<IngredientRegulatoryProfile[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<IngredientRegulatoryProfile> {
    const profile = await this.repository.findById(id, ctx)
    if (!profile) {
      throw new IngredientRegulatoryProfileNotFoundError(id)
    }
    return profile
  }

  async findByIngredientId(
    ingredientId: string,
    ctx: RequestContext
  ): Promise<IngredientRegulatoryProfile> {
    let profile = await this.repository.findByIngredientId(ingredientId, ctx)
    if (!profile) {
      // Auto-create empty profile on first read
      let tenantId: string
      if (ctx.scope === UserScope.TENANT) {
        tenantId = ctx.tenantId
      } else {
        const ingredient = await this.prisma.ingredient_TE.findUnique({
          where: { id: ingredientId }
        })
        if (!ingredient) throw new NotFoundException('Ingredient not found')
        tenantId = ingredient.tenantId
      }

      profile = IngredientRegulatoryProfile.create({
        ingredientId,
        tenantId,
        hasRtiq: false,
        isGmo: false,
        gmoIngredient: null,
        gmoDonorSpecies: null,
        gmoPercentage: null,
        isIrradiated: false,
        irradiatedIngredient: null,
        containsLactose: false,
        containsGluten: false,
        containsAspartame: false,
        flavorOriginType: null,
        colorantOriginType: null
      })
      profile = await this.repository.save(profile, ctx)
    }
    return profile
  }

  async save(
    profile: IngredientRegulatoryProfile,
    ctx: RequestContext
  ): Promise<IngredientRegulatoryProfile> {
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
  ): Promise<IngredientRegulatoryProfile> {
    const profile = await this.findById(id, ctx)
    profile.activate()
    return this.repository.save(profile, ctx)
  }

  async lock(
    id: string,
    ctx: RequestContext
  ): Promise<IngredientRegulatoryProfile> {
    const profile = await this.findById(id, ctx)
    profile.lock()
    return this.repository.save(profile, ctx)
  }

  async unlock(
    id: string,
    ctx: RequestContext
  ): Promise<IngredientRegulatoryProfile> {
    const entity = await this.findById(id, ctx)
    entity.unlock()
    return this.repository.save(entity, ctx)
  }
}
