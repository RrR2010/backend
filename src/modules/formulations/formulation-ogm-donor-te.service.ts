import { Injectable, InternalServerErrorException } from '@nestjs/common'
import {
  FormulationOgmDonor_TE_Repository,
  FormulationOgmDonorFilter
} from './formulation-ogm-donor-te.repository'
import {
  FormulationOgmDonor_TE,
  CreateFormulationOgmDonor_TEProps
} from './formulation-ogm-donor-te.entity'
import { FormulationOgmDonor_TENotFoundError } from './formulation-ogm-donor-te.errors'
import type { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

@Injectable()
export class FormulationOgmDonor_TEService {
  constructor(
    private readonly repository: FormulationOgmDonor_TE_Repository
  ) {}

  async create(
    props: CreateFormulationOgmDonor_TEProps,
    ctx: RequestContext
  ): Promise<FormulationOgmDonor_TE> {
    const effectiveTenantId = getEffectiveTenantId(ctx)
    const tenantId =
      ctx.scope === UserScope.TENANT
        ? ctx.tenantId
        : (effectiveTenantId ?? props.tenantId)
    if (!tenantId) throw new InternalServerErrorException('tenantId is required')
    const entry = FormulationOgmDonor_TE.create({ ...props, tenantId })
    return this.repository.save(entry, ctx)
  }

  async findAll(
    filter: FormulationOgmDonorFilter,
    ctx: RequestContext
  ): Promise<FormulationOgmDonor_TE[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<FormulationOgmDonor_TE> {
    const entry = await this.repository.findById(id, ctx)
    if (!entry) {
      throw new FormulationOgmDonor_TENotFoundError(id)
    }
    return entry
  }

  async findByRevisionId(
    revisionId: string,
    ctx: RequestContext
  ): Promise<FormulationOgmDonor_TE[]> {
    return this.repository.findByRevisionId(revisionId, ctx)
  }

  async save(
    entry: FormulationOgmDonor_TE,
    ctx: RequestContext
  ): Promise<FormulationOgmDonor_TE> {
    return this.repository.save(entry, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const entry = await this.findById(id, ctx)
    await this.repository.delete(entry.id.value, ctx)
  }
}
