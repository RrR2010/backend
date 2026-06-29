import { Injectable, InternalServerErrorException } from '@nestjs/common'
import {
  FunctionalGroupRepository,
  FunctionalGroupFilter
} from '@ingredients/functional-group.repository'
import {
  FunctionalGroup_TE,
  CreateFunctionalGroup_TEProps
} from '@ingredients/functional-group.entity'
import {
  FunctionalGroupNotFoundError,
  FunctionalGroupAlreadyExistsError
} from '@ingredients/functional-group.errors'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'
import { Prisma } from '@prisma/client'

@Injectable()
export class FunctionalGroupService {
  constructor(private readonly repository: FunctionalGroupRepository) {}

  async create(
    props: Omit<CreateFunctionalGroup_TEProps, 'tenantId'>,
    ctx: RequestContext
  ): Promise<FunctionalGroup_TE> {
    // TODO: zod validate input
    const effectiveTenantId = getEffectiveTenantId(ctx)
    const tenantId =
      ctx.scope === UserScope.TENANT
        ? ctx.tenantId
        : effectiveTenantId
    if (!tenantId) throw new InternalServerErrorException('tenantId is required')
    const group = FunctionalGroup_TE.create({ ...props, tenantId })
    try {
      return await this.repository.save(group, ctx)
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new FunctionalGroupAlreadyExistsError()
      }
      throw error
    }
  }

  async findAll(
    filter: FunctionalGroupFilter,
    ctx: RequestContext
  ): Promise<FunctionalGroup_TE[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(id: string, ctx: RequestContext): Promise<FunctionalGroup_TE> {
    const group = await this.repository.findById(id, ctx)
    if (!group) {
      throw new FunctionalGroupNotFoundError(id)
    }
    return group
  }

  async save(
    group: FunctionalGroup_TE,
    ctx: RequestContext
  ): Promise<FunctionalGroup_TE> {
    return this.repository.save(group, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const group = await this.findById(id, ctx)
    group.delete()
    await this.repository.save(group, ctx)
  }

  async activate(id: string, ctx: RequestContext): Promise<FunctionalGroup_TE> {
    const group = await this.findById(id, ctx)
    group.activate()
    return this.repository.save(group, ctx)
  }

  async lock(id: string, ctx: RequestContext): Promise<FunctionalGroup_TE> {
    const group = await this.findById(id, ctx)
    group.lock()
    return this.repository.save(group, ctx)
  }

  async unlock(id: string, ctx: RequestContext): Promise<FunctionalGroup_TE> {
    const group = await this.findById(id, ctx)
    group.unlock()
    return this.repository.save(group, ctx)
  }
}
