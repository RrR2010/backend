import { Injectable } from '@nestjs/common'
import { ComplianceRule_PLRepository } from '@ingredients/compliance-rule-pl.repository'
import {
  ComplianceRule_PL,
  CreateComplianceRulePLProps
} from '@ingredients/compliance-rule-pl.entity'
import { ComplianceRule_PLNotFoundError } from '@ingredients/compliance-rule-pl.errors'
import { RequestContext } from '@authorization/authorization.types'

@Injectable()
export class ComplianceRule_PLService {
  constructor(
    private readonly repository: ComplianceRule_PLRepository
  ) {}

  async create(
    props: CreateComplianceRulePLProps,
    _ctx: RequestContext
  ): Promise<ComplianceRule_PL> {
    const entity = ComplianceRule_PL.create(props)
    return this.repository.save(entity, _ctx)
  }

  async findAll(_ctx: RequestContext): Promise<ComplianceRule_PL[]> {
    return this.repository.findAll({}, _ctx)
  }

  async findById(
    id: string,
    _ctx: RequestContext
  ): Promise<ComplianceRule_PL> {
    const entity = await this.repository.findById(id, _ctx)
    if (!entity) {
      throw new ComplianceRule_PLNotFoundError()
    }
    return entity
  }

  async findByRegulation(
    regulationId: string,
    _ctx: RequestContext
  ): Promise<ComplianceRule_PL[]> {
    return this.repository.findByRegulation(regulationId, _ctx)
  }

  async save(
    entity: ComplianceRule_PL,
    _ctx: RequestContext
  ): Promise<ComplianceRule_PL> {
    return this.repository.save(entity, _ctx)
  }

  async delete(id: string, _ctx: RequestContext): Promise<void> {
    const entity = await this.findById(id, _ctx)
    entity.delete()
    await this.repository.save(entity, _ctx)
  }

  async activate(
    id: string,
    _ctx: RequestContext
  ): Promise<ComplianceRule_PL> {
    const entity = await this.findById(id, _ctx)
    entity.activate()
    return this.repository.save(entity, _ctx)
  }

  async lock(
    id: string,
    _ctx: RequestContext
  ): Promise<ComplianceRule_PL> {
    const entity = await this.findById(id, _ctx)
    entity.lock()
    return this.repository.save(entity, _ctx)
  }

  async unlock(
    id: string,
    _ctx: RequestContext
  ): Promise<ComplianceRule_PL> {
    const entity = await this.findById(id, _ctx)
    entity.unlock()
    return this.repository.save(entity, _ctx)
  }
}
