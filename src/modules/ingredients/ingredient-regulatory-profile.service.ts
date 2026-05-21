import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { IngredientRegulatoryProfileRepository, IngredientRegulatoryProfileFilter } from '@ingredients/ingredient-regulatory-profile.repository'
import { IngredientRegulatoryProfile, CreateIngredientRegulatoryProfileProps } from '@ingredients/ingredient-regulatory-profile.entity'
import { IngredientRegulatoryProfileNotFoundError, IngredientRegulatoryProfileAlreadyExistsError } from '@ingredients/ingredient-regulatory-profile.errors'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'

@Injectable()
export class IngredientRegulatoryProfileService {
  constructor(private readonly repository: IngredientRegulatoryProfileRepository) {}

  async create(props: CreateIngredientRegulatoryProfileProps, ctx: RequestContext): Promise<IngredientRegulatoryProfile> {
    // TODO: zod validate input
    const tenantId = ctx.scope === UserScope.TENANT ? ctx.tenantId : props.tenantId
    const profile = IngredientRegulatoryProfile.create({ ...props, tenantId })
    try {
      return await this.repository.save(profile, ctx)
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new IngredientRegulatoryProfileAlreadyExistsError(props.ingredientId, tenantId)
      }
      throw error
    }
  }

  async findAll(filter: IngredientRegulatoryProfileFilter, ctx: RequestContext): Promise<IngredientRegulatoryProfile[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(id: string, ctx: RequestContext): Promise<IngredientRegulatoryProfile> {
    const profile = await this.repository.findById(id, ctx)
    if (!profile) {
      throw new IngredientRegulatoryProfileNotFoundError(id)
    }
    return profile
  }

  async findByIngredientId(ingredientId: string, ctx: RequestContext): Promise<IngredientRegulatoryProfile> {
    const profile = await this.repository.findByIngredientId(ingredientId, ctx)
    if (!profile) {
      throw new IngredientRegulatoryProfileNotFoundError(`for ingredient ${ingredientId}`)
    }
    return profile
  }

  async save(profile: IngredientRegulatoryProfile, ctx: RequestContext): Promise<IngredientRegulatoryProfile> {
    return this.repository.save(profile, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const profile = await this.findById(id, ctx)
    profile.delete()
    await this.repository.save(profile, ctx)
  }

  async activate(id: string, ctx: RequestContext): Promise<IngredientRegulatoryProfile> {
    const profile = await this.findById(id, ctx)
    profile.activate()
    return this.repository.save(profile, ctx)
  }

  async lock(id: string, ctx: RequestContext): Promise<IngredientRegulatoryProfile> {
    const profile = await this.findById(id, ctx)
    profile.lock()
    return this.repository.save(profile, ctx)
  }
}
