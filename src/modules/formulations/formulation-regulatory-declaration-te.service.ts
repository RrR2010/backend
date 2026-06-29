import { Injectable, InternalServerErrorException } from '@nestjs/common'
import {
  FormulationRegulatoryDeclaration_TE_Repository,
  FormulationRegulatoryDeclarationFilter
} from './formulation-regulatory-declaration-te.repository'
import {
  FormulationRegulatoryDeclaration_TE,
  CreateFormulationRegulatoryDeclaration_TEProps
} from './formulation-regulatory-declaration-te.entity'
import { FormulationRegulatoryDeclaration_TENotFoundError } from './formulation-regulatory-declaration-te.errors'
import type { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

@Injectable()
export class FormulationRegulatoryDeclaration_TEService {
  constructor(
    private readonly repository: FormulationRegulatoryDeclaration_TE_Repository
  ) {}

  async create(
    props: CreateFormulationRegulatoryDeclaration_TEProps,
    ctx: RequestContext
  ): Promise<FormulationRegulatoryDeclaration_TE> {
    const effectiveTenantId = getEffectiveTenantId(ctx)
    const tenantId =
      ctx.scope === UserScope.TENANT
        ? ctx.tenantId
        : (effectiveTenantId ?? props.tenantId)
    if (!tenantId) throw new InternalServerErrorException('tenantId is required')
    const entry = FormulationRegulatoryDeclaration_TE.create({
      ...props,
      tenantId
    })
    return this.repository.save(entry, ctx)
  }

  async findAll(
    filter: FormulationRegulatoryDeclarationFilter,
    ctx: RequestContext
  ): Promise<FormulationRegulatoryDeclaration_TE[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<FormulationRegulatoryDeclaration_TE> {
    const entry = await this.repository.findById(id, ctx)
    if (!entry) {
      throw new FormulationRegulatoryDeclaration_TENotFoundError(id)
    }
    return entry
  }

  async findByRevisionId(
    revisionId: string,
    ctx: RequestContext
  ): Promise<FormulationRegulatoryDeclaration_TE[]> {
    return this.repository.findByRevisionId(revisionId, ctx)
  }

  async save(
    entry: FormulationRegulatoryDeclaration_TE,
    ctx: RequestContext
  ): Promise<FormulationRegulatoryDeclaration_TE> {
    return this.repository.save(entry, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const entry = await this.findById(id, ctx)
    await this.repository.delete(entry.id.value, ctx)
  }
}
