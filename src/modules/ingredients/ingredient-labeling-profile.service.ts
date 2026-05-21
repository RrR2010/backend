import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { IngredientLabelingProfileRepository, IngredientLabelingProfileFilter } from '@ingredients/ingredient-labeling-profile.repository'
import { IngredientLabelingProfile, CreateIngredientLabelingProfileProps } from '@ingredients/ingredient-labeling-profile.entity'
import { IngredientLabelingProfileNotFoundError, IngredientLabelingProfileAlreadyExistsError } from '@ingredients/ingredient-labeling-profile.errors'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'

@Injectable()
export class IngredientLabelingProfileService {
  constructor(private readonly repository: IngredientLabelingProfileRepository) {}

  async create(props: CreateIngredientLabelingProfileProps, ctx: RequestContext): Promise<IngredientLabelingProfile> {
    // TODO: zod validate input
    const tenantId = ctx.scope === UserScope.TENANT ? ctx.tenantId : props.tenantId
    const profile = IngredientLabelingProfile.create({ ...props, tenantId })
    try {
      return await this.repository.save(profile, ctx)
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new IngredientLabelingProfileAlreadyExistsError(props.ingredientId, tenantId)
      }
      throw error
    }
  }

  async findAll(filter: IngredientLabelingProfileFilter, ctx: RequestContext): Promise<IngredientLabelingProfile[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(id: string, ctx: RequestContext): Promise<IngredientLabelingProfile> {
    const profile = await this.repository.findById(id, ctx)
    if (!profile) {
      throw new IngredientLabelingProfileNotFoundError(id)
    }
    return profile
  }

  async findByIngredientId(ingredientId: string, ctx: RequestContext): Promise<IngredientLabelingProfile> {
    const profile = await this.repository.findByIngredientId(ingredientId, ctx)
    if (!profile) {
      throw new IngredientLabelingProfileNotFoundError(`for ingredient ${ingredientId}`)
    }
    return profile
  }

  async save(profile: IngredientLabelingProfile, ctx: RequestContext): Promise<IngredientLabelingProfile> {
    return this.repository.save(profile, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const profile = await this.findById(id, ctx)
    profile.delete()
    await this.repository.save(profile, ctx)
  }

  async activate(id: string, ctx: RequestContext): Promise<IngredientLabelingProfile> {
    const profile = await this.findById(id, ctx)
    profile.activate()
    return this.repository.save(profile, ctx)
  }

  async lock(id: string, ctx: RequestContext): Promise<IngredientLabelingProfile> {
    const profile = await this.findById(id, ctx)
    profile.lock()
    return this.repository.save(profile, ctx)
  }
}
