import { Injectable, InternalServerErrorException } from '@nestjs/common'
import {
  FormulationNutrition_TE_Repository,
  FormulationNutritionFilter
} from './formulation-nutrition-te.repository'
import {
  FormulationNutrition_TE,
  CreateFormulationNutrition_TEProps
} from './formulation-nutrition-te.entity'
import { FormulationNutrition_TENotFoundError } from './formulation-nutrition-te.errors'
import type { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

@Injectable()
export class FormulationNutrition_TEService {
  constructor(
    private readonly repository: FormulationNutrition_TE_Repository
  ) {}

  async create(
    props: CreateFormulationNutrition_TEProps,
    ctx: RequestContext
  ): Promise<FormulationNutrition_TE> {
    const effectiveTenantId = getEffectiveTenantId(ctx)
    const tenantId =
      ctx.scope === UserScope.TENANT
        ? ctx.tenantId
        : (effectiveTenantId ?? props.tenantId)
    if (!tenantId) throw new InternalServerErrorException('tenantId is required')
    const entry = FormulationNutrition_TE.create({ ...props, tenantId })
    return this.repository.save(entry, ctx)
  }

  async findAll(
    filter: FormulationNutritionFilter,
    ctx: RequestContext
  ): Promise<FormulationNutrition_TE[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<FormulationNutrition_TE> {
    const entry = await this.repository.findById(id, ctx)
    if (!entry) {
      throw new FormulationNutrition_TENotFoundError(id)
    }
    return entry
  }

  async findByRevisionId(
    revisionId: string,
    ctx: RequestContext
  ): Promise<FormulationNutrition_TE[]> {
    return this.repository.findByRevisionId(revisionId, ctx)
  }

  async save(
    entry: FormulationNutrition_TE,
    ctx: RequestContext
  ): Promise<FormulationNutrition_TE> {
    return this.repository.save(entry, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const entry = await this.findById(id, ctx)
    await this.repository.delete(entry.id.value, ctx)
  }
}
