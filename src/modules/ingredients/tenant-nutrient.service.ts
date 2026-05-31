import { Injectable } from '@nestjs/common'
import {
  TenantNutrientRepository,
  TenantNutrientFilter
} from '@ingredients/tenant-nutrient.repository'
import {
  TenantNutrient,
  CreateTenantNutrientProps
} from '@ingredients/tenant-nutrient.entity'
import {
  TenantNutrientNotFoundError,
  TenantNutrientAlreadyExistsError,
  TenantNutrientMissingTenantIdError
} from '@ingredients/tenant-nutrient.errors'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { Prisma } from '@prisma/client'

@Injectable()
export class TenantNutrientService {
  constructor(private readonly repository: TenantNutrientRepository) {}

  async create(
    props: CreateTenantNutrientProps,
    ctx: RequestContext
  ): Promise<TenantNutrient> {
    // TODO: zod validate input
    const tenantId =
      ctx.scope === UserScope.TENANT ? ctx.tenantId : props.tenantId
    if (!tenantId) {
      throw new TenantNutrientMissingTenantIdError()
    }
    const nutrient = TenantNutrient.create({ ...props, tenantId })
    try {
      return await this.repository.save(nutrient, ctx)
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new TenantNutrientAlreadyExistsError(props.name, tenantId)
      }
      throw error
    }
  }

  async findAll(
    filter: TenantNutrientFilter,
    ctx: RequestContext
  ): Promise<TenantNutrient[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(id: string, ctx: RequestContext): Promise<TenantNutrient> {
    const nutrient = await this.repository.findById(id, ctx)
    if (!nutrient) {
      throw new TenantNutrientNotFoundError(id)
    }
    return nutrient
  }

  async save(
    nutrient: TenantNutrient,
    ctx: RequestContext
  ): Promise<TenantNutrient> {
    return this.repository.save(nutrient, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const nutrient = await this.findById(id, ctx)
    nutrient.delete()
    await this.repository.save(nutrient, ctx)
  }

  async activate(id: string, ctx: RequestContext): Promise<TenantNutrient> {
    const nutrient = await this.findById(id, ctx)
    nutrient.activate()
    return this.repository.save(nutrient, ctx)
  }

  async lock(id: string, ctx: RequestContext): Promise<TenantNutrient> {
    const nutrient = await this.findById(id, ctx)
    nutrient.lock()
    return this.repository.save(nutrient, ctx)
  }

  async unlock(id: string, ctx: RequestContext): Promise<TenantNutrient> {
    const nutrient = await this.findById(id, ctx)
    nutrient.unlock()
    return this.repository.save(nutrient, ctx)
  }
}
