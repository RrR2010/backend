import { Injectable } from '@nestjs/common'
import {
  ProductFamily_TE_Repository,
  ProductFamily_TEFilter
} from '@products/product-family-te.repository'
import {
  ProductFamily_TE,
  CreateProductFamily_TEProps
} from '@products/product-family-te.entity'
import {
  ProductFamily_TENotFoundError,
  ProductFamily_TEAlreadyExistsError
} from '@products/product-family-te.errors'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'
import { Prisma } from '@prisma/client'

@Injectable()
export class ProductFamily_TEService {
  constructor(private readonly repository: ProductFamily_TE_Repository) {}

  async create(
    props: CreateProductFamily_TEProps,
    ctx: RequestContext
  ): Promise<ProductFamily_TE> {
    // TODO: zod validate input
    const effectiveTenantId = getEffectiveTenantId(ctx) ?? ''
    const tenantId =
      ctx.scope === UserScope.TENANT
        ? ctx.tenantId
        : props.tenantId || effectiveTenantId
    const family = ProductFamily_TE.create({ ...props, tenantId })
    try {
      return await this.repository.save(family, ctx)
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ProductFamily_TEAlreadyExistsError()
      }
      throw error
    }
  }

  async findAll(
    filter: ProductFamily_TEFilter,
    ctx: RequestContext
  ): Promise<ProductFamily_TE[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(id: string, ctx: RequestContext): Promise<ProductFamily_TE> {
    const family = await this.repository.findById(id, ctx)
    if (!family) {
      throw new ProductFamily_TENotFoundError(id)
    }
    return family
  }

  async save(
    family: ProductFamily_TE,
    ctx: RequestContext
  ): Promise<ProductFamily_TE> {
    return this.repository.save(family, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const family = await this.findById(id, ctx)
    family.delete()
    await this.repository.save(family, ctx)
  }
}
