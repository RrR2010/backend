import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { FormulationAllergen_TE_Repository } from './formulation-allergen-te.repository'
import {
  FormulationAllergen_TE,
  CreateFormulationAllergen_TEProps
} from './formulation-allergen-te.entity'
import { FormulationAllergen_TENotFoundError } from './formulation-allergen-te.errors'
import type { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

@Injectable()
export class FormulationAllergen_TEService {
  constructor(
    private readonly repository: FormulationAllergen_TE_Repository
  ) {}

  async create(
    props: CreateFormulationAllergen_TEProps,
    ctx: RequestContext
  ): Promise<FormulationAllergen_TE> {
    const effectiveTenantId = getEffectiveTenantId(ctx)
    const tenantId =
      ctx.scope === UserScope.TENANT
        ? ctx.tenantId
        : (effectiveTenantId ?? props.tenantId)
    if (!tenantId) throw new InternalServerErrorException('tenantId is required')
    const entry = FormulationAllergen_TE.create({ ...props, tenantId })
    return this.repository.save(entry, ctx)
  }

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<FormulationAllergen_TE> {
    const entry = await this.repository.findById(id, ctx)
    if (!entry) {
      throw new FormulationAllergen_TENotFoundError(id)
    }
    return entry
  }

  async findByRevisionId(
    revisionId: string,
    ctx: RequestContext
  ): Promise<FormulationAllergen_TE | null> {
    return this.repository.findByRevisionId(revisionId, ctx)
  }

  async save(
    entry: FormulationAllergen_TE,
    ctx: RequestContext
  ): Promise<FormulationAllergen_TE> {
    return this.repository.save(entry, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const entry = await this.findById(id, ctx)
    await this.repository.delete(entry.id.value, ctx)
  }
}
