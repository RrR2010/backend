import { Injectable } from '@nestjs/common'
import {
  FunctionalGroupRepository,
  FunctionalGroupFilter
} from '@ingredients/functional-group.repository'
import {
  FunctionalGroup,
  CreateFunctionalGroupProps
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
    props: CreateFunctionalGroupProps,
    ctx: RequestContext
  ): Promise<FunctionalGroup> {
    // TODO: zod validate input
    const effectiveTenantId = getEffectiveTenantId(ctx) ?? ''
    const tenantId =
      ctx.scope === UserScope.TENANT
        ? ctx.tenantId
        : (props.tenantId || effectiveTenantId)
    const group = FunctionalGroup.create({ ...props, tenantId })
    try {
      return await this.repository.save(group, ctx)
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new FunctionalGroupAlreadyExistsError(props.name, tenantId)
      }
      throw error
    }
  }

  async findAll(
    filter: FunctionalGroupFilter,
    ctx: RequestContext
  ): Promise<FunctionalGroup[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(id: string, ctx: RequestContext): Promise<FunctionalGroup> {
    const group = await this.repository.findById(id, ctx)
    if (!group) {
      throw new FunctionalGroupNotFoundError(id)
    }
    return group
  }

  async save(
    group: FunctionalGroup,
    ctx: RequestContext
  ): Promise<FunctionalGroup> {
    return this.repository.save(group, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const group = await this.findById(id, ctx)
    group.delete()
    await this.repository.save(group, ctx)
  }

  async activate(id: string, ctx: RequestContext): Promise<FunctionalGroup> {
    const group = await this.findById(id, ctx)
    group.activate()
    return this.repository.save(group, ctx)
  }

  async lock(id: string, ctx: RequestContext): Promise<FunctionalGroup> {
    const group = await this.findById(id, ctx)
    group.lock()
    return this.repository.save(group, ctx)
  }

  async unlock(id: string, ctx: RequestContext): Promise<FunctionalGroup> {
    const group = await this.findById(id, ctx)
    group.unlock()
    return this.repository.save(group, ctx)
  }
}
