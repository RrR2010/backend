import { Injectable } from '@nestjs/common'
import type { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'
import {
  FormulationVersion_TE_Repository, FormulationRevision_TE_Repository, FormulationItem_TE_Repository,
} from './formulation.repository'
import { FormulationVersion_TE, type CreateFormulationVersion_TEProps } from './formulation-version.entity'
import { FormulationRevision_TE, type CreateFormulationRevision_TEProps } from './formulation-revision.entity'
import { FormulationItem_TE, type CreateFormulationItem_TEProps } from './formulation-item.entity'
import { FormulationVersion_TENotFoundError, FormulationRevision_TENotFoundError, FormulationItem_TENotFoundError } from './formulation.errors'

@Injectable()
export class FormulationService {
  constructor(
    private readonly versionRepo: FormulationVersion_TE_Repository,
    private readonly revisionRepo: FormulationRevision_TE_Repository,
    private readonly itemRepo: FormulationItem_TE_Repository,
  ) {}

  // --- Versions ---

  async createVersion(props: CreateFormulationVersion_TEProps, ctx: RequestContext): Promise<FormulationVersion_TE> {
    const effectiveTenantId = getEffectiveTenantId(ctx) ?? ''
    const tenantId = ctx.scope === UserScope.TENANT ? ctx.tenantId : (props.tenantId || effectiveTenantId)
    const version = FormulationVersion_TE.create({ ...props, tenantId })
    return this.versionRepo.save(version, ctx)
  }

  async findAllVersions(ctx: RequestContext): Promise<FormulationVersion_TE[]> {
    return this.versionRepo.findAll(ctx)
  }

  async findVersionsByProduct(productId: string, ctx: RequestContext): Promise<FormulationVersion_TE[]> {
    return this.versionRepo.findByProductId(productId, ctx)
  }

  async findVersionById(id: string, ctx: RequestContext): Promise<FormulationVersion_TE> {
    const version = await this.versionRepo.findById(id, ctx)
    if (!version) throw new FormulationVersion_TENotFoundError()
    return version
  }

  async deleteVersion(id: string, ctx: RequestContext): Promise<void> {
    await this.findVersionById(id, ctx)
    await this.versionRepo.delete(id, ctx)
  }

  // --- Revisions ---

  async createRevision(props: Omit<CreateFormulationRevision_TEProps, 'tenantId'>, ctx: RequestContext): Promise<FormulationRevision_TE> {
    const tenantId = getEffectiveTenantId(ctx) ?? ''
    const revision = FormulationRevision_TE.create({ ...props, tenantId })
    return this.revisionRepo.save(revision, ctx)
  }

  async findRevisionsByVersion(versionId: string, ctx: RequestContext): Promise<FormulationRevision_TE[]> {
    return this.revisionRepo.findByVersionId(versionId, ctx)
  }

  async findRevisionById(id: string, ctx: RequestContext): Promise<FormulationRevision_TE> {
    const revision = await this.revisionRepo.findById(id, ctx)
    if (!revision) throw new FormulationRevision_TENotFoundError()
    return revision
  }

  // --- Items ---

  async createItem(props: Omit<CreateFormulationItem_TEProps, 'tenantId'>, ctx: RequestContext): Promise<FormulationItem_TE> {
    const tenantId = getEffectiveTenantId(ctx) ?? ''
    const item = FormulationItem_TE.create({ ...props, tenantId })
    return this.itemRepo.save(item, ctx)
  }

  async findItemsByRevision(revisionId: string, ctx: RequestContext): Promise<FormulationItem_TE[]> {
    return this.itemRepo.findByRevisionId(revisionId, ctx)
  }

  async findItemById(id: string, ctx: RequestContext): Promise<FormulationItem_TE> {
    const item = await this.itemRepo.findById(id, ctx)
    if (!item) throw new FormulationItem_TENotFoundError()
    return item
  }

  async deleteItem(id: string, ctx: RequestContext): Promise<void> {
    await this.findItemById(id, ctx)
    await this.itemRepo.delete(id, ctx)
  }
}
