import { Injectable } from '@nestjs/common'
import {
  TenantAllergenRepository,
  TenantAllergenFilter
} from '@ingredients/tenant-allergen.repository'
import {
  TenantAllergen,
  CreateTenantAllergenProps
} from '@ingredients/tenant-allergen.entity'
import {
  TenantAllergenNotFoundError,
  TenantAllergenAlreadyExistsError
} from '@ingredients/tenant-allergen.errors'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'
import { Prisma } from '@prisma/client'

@Injectable()
export class TenantAllergenService {
  constructor(private readonly repository: TenantAllergenRepository) {}

  async create(
    props: CreateTenantAllergenProps,
    ctx: RequestContext
  ): Promise<TenantAllergen> {
    // TODO: zod validate input
    const tenantId =
      ctx.scope === UserScope.TENANT
        ? ctx.tenantId
        : (props.tenantId ?? getEffectiveTenantId(ctx))
    const allergen = TenantAllergen.create({ ...props, tenantId })
    try {
      return await this.repository.save(allergen, ctx)
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new TenantAllergenAlreadyExistsError(props.name, tenantId)
      }
      throw error
    }
  }

  async findAll(
    filter: TenantAllergenFilter,
    ctx: RequestContext
  ): Promise<TenantAllergen[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(id: string, ctx: RequestContext): Promise<TenantAllergen> {
    const allergen = await this.repository.findById(id, ctx)
    if (!allergen) {
      throw new TenantAllergenNotFoundError(id)
    }
    return allergen
  }

  async save(
    allergen: TenantAllergen,
    ctx: RequestContext
  ): Promise<TenantAllergen> {
    return this.repository.save(allergen, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const allergen = await this.findById(id, ctx)
    allergen.delete()
    await this.repository.save(allergen, ctx)
  }

  async activate(id: string, ctx: RequestContext): Promise<TenantAllergen> {
    const allergen = await this.findById(id, ctx)
    allergen.activate()
    return this.repository.save(allergen, ctx)
  }

  async lock(id: string, ctx: RequestContext): Promise<TenantAllergen> {
    const allergen = await this.findById(id, ctx)
    allergen.lock()
    return this.repository.save(allergen, ctx)
  }

  async unlock(id: string, ctx: RequestContext): Promise<TenantAllergen> {
    const allergen = await this.findById(id, ctx)
    allergen.unlock()
    return this.repository.save(allergen, ctx)
  }
}
