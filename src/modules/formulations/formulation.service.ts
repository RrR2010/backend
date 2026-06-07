import { Injectable } from '@nestjs/common'
import type { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'
import {
  FormulationVersionRepository, FormulationRevisionRepository, FormulationItemRepository,
} from './formulation.repository'
import { FormulationVersion, type CreateFormulationVersionProps } from './formulation-version.entity'
import { FormulationRevision, type CreateFormulationRevisionProps } from './formulation-revision.entity'
import { FormulationItem, type CreateFormulationItemProps } from './formulation-item.entity'
import { FormulationVersionNotFoundError, FormulationRevisionNotFoundError, FormulationItemNotFoundError } from './formulation.errors'

@Injectable()
export class FormulationService {
  constructor(
    private readonly versionRepo: FormulationVersionRepository,
    private readonly revisionRepo: FormulationRevisionRepository,
    private readonly itemRepo: FormulationItemRepository,
  ) {}

  // --- Versions ---

  async createVersion(props: CreateFormulationVersionProps, ctx: RequestContext): Promise<FormulationVersion> {
    const effectiveTenantId = getEffectiveTenantId(ctx) ?? ''
    const tenantId = ctx.scope === UserScope.TENANT ? ctx.tenantId : (props.tenantId || effectiveTenantId)
    const version = FormulationVersion.create({ ...props, tenantId })
    return this.versionRepo.save(version, ctx)
  }

  async findAllVersions(ctx: RequestContext): Promise<FormulationVersion[]> {
    return this.versionRepo.findAll(ctx)
  }

  async findVersionsByProduct(productId: string, ctx: RequestContext): Promise<FormulationVersion[]> {
    return this.versionRepo.findByProductId(productId, ctx)
  }

  async findVersionById(id: string, ctx: RequestContext): Promise<FormulationVersion> {
    const v = await this.versionRepo.findById(id, ctx)
    if (!v) throw new FormulationVersionNotFoundError()
    return v
  }

  async deleteVersion(id: string, ctx: RequestContext): Promise<void> {
    await this.findVersionById(id, ctx)
    await this.versionRepo.delete(id, ctx)
  }

  // --- Revisions ---

  async createRevision(props: CreateFormulationRevisionProps, _ctx: RequestContext): Promise<FormulationRevision> {
    const revision = FormulationRevision.create(props)
    return this.revisionRepo.save(revision, _ctx)
  }

  async findRevisionsByVersion(versionId: string, ctx: RequestContext): Promise<FormulationRevision[]> {
    return this.revisionRepo.findByVersionId(versionId, ctx)
  }

  async findRevisionById(id: string, ctx: RequestContext): Promise<FormulationRevision> {
    const r = await this.revisionRepo.findById(id, ctx)
    if (!r) throw new FormulationRevisionNotFoundError()
    return r
  }

  // --- Items ---

  async createItem(props: CreateFormulationItemProps, ctx: RequestContext): Promise<FormulationItem> {
    const item = FormulationItem.create(props)
    return this.itemRepo.save(item, ctx)
  }

  async findItemsByRevision(revisionId: string, ctx: RequestContext): Promise<FormulationItem[]> {
    return this.itemRepo.findByRevisionId(revisionId, ctx)
  }

  async findItemById(id: string, ctx: RequestContext): Promise<FormulationItem> {
    const i = await this.itemRepo.findById(id, ctx)
    if (!i) throw new FormulationItemNotFoundError()
    return i
  }

  async deleteItem(id: string, ctx: RequestContext): Promise<void> {
    await this.findItemById(id, ctx)
    await this.itemRepo.delete(id, ctx)
  }
}
