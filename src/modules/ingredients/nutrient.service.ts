import { Injectable } from '@nestjs/common'
import {
  NutrientRepository,
  NutrientFilter
} from '@ingredients/nutrient.repository'
import { Nutrient, CreateNutrientProps } from '@ingredients/nutrient.entity'
import {
  NutrientNotFoundError,
  NutrientAlreadyExistsError
} from '@ingredients/nutrient.errors'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { Prisma } from '@prisma/client'

@Injectable()
export class NutrientService {
  constructor(private readonly repository: NutrientRepository) {}

  async create(
    props: CreateNutrientProps,
    ctx: RequestContext
  ): Promise<Nutrient> {
    // TODO: zod validate input
    const tenantId =
      ctx.scope === UserScope.TENANT ? ctx.tenantId : props.tenantId
    const nutrient = Nutrient.create({ ...props, tenantId })
    try {
      return await this.repository.save(nutrient, ctx)
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new NutrientAlreadyExistsError(props.name, tenantId)
      }
      throw error
    }
  }

  async findAll(
    filter: NutrientFilter,
    ctx: RequestContext
  ): Promise<Nutrient[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(id: string, ctx: RequestContext): Promise<Nutrient> {
    const nutrient = await this.repository.findById(id, ctx)
    if (!nutrient) {
      throw new NutrientNotFoundError(id)
    }
    return nutrient
  }

  async save(nutrient: Nutrient, ctx: RequestContext): Promise<Nutrient> {
    return this.repository.save(nutrient, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const nutrient = await this.findById(id, ctx)
    nutrient.delete()
    await this.repository.save(nutrient, ctx)
  }

  async activate(id: string, ctx: RequestContext): Promise<Nutrient> {
    const nutrient = await this.findById(id, ctx)
    nutrient.activate()
    return this.repository.save(nutrient, ctx)
  }

  async lock(id: string, ctx: RequestContext): Promise<Nutrient> {
    const nutrient = await this.findById(id, ctx)
    nutrient.lock()
    return this.repository.save(nutrient, ctx)
  }

  async unlock(id: string, ctx: RequestContext): Promise<Nutrient> {
    const nutrient = await this.findById(id, ctx)
    nutrient.unlock()
    return this.repository.save(nutrient, ctx)
  }
}
