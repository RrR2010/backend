import { Injectable } from '@nestjs/common'
import { RegulatoryBody_PLRepository } from '@ingredients/regulatory-body-pl.repository'
import {
  RegulatoryBody_PL,
  CreateRegulatoryBodyPLProps
} from '@ingredients/regulatory-body-pl.entity'
import { RegulatoryBody_PLNotFoundError } from '@ingredients/regulatory-body-pl.errors'
import { RequestContext } from '@authorization/authorization.types'

@Injectable()
export class RegulatoryBody_PLService {
  constructor(
    private readonly repository: RegulatoryBody_PLRepository
  ) {}

  async create(
    props: CreateRegulatoryBodyPLProps,
    _ctx: RequestContext
  ): Promise<RegulatoryBody_PL> {
    const entity = RegulatoryBody_PL.create(props)
    return this.repository.save(entity, _ctx)
  }

  async findAll(_ctx: RequestContext): Promise<RegulatoryBody_PL[]> {
    return this.repository.findAll({}, _ctx)
  }

  async findById(
    id: string,
    _ctx: RequestContext
  ): Promise<RegulatoryBody_PL> {
    const entity = await this.repository.findById(id, _ctx)
    if (!entity) {
      throw new RegulatoryBody_PLNotFoundError()
    }
    return entity
  }

  async save(
    entity: RegulatoryBody_PL,
    _ctx: RequestContext
  ): Promise<RegulatoryBody_PL> {
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
  ): Promise<RegulatoryBody_PL> {
    const entity = await this.findById(id, _ctx)
    entity.activate()
    return this.repository.save(entity, _ctx)
  }

  async lock(
    id: string,
    _ctx: RequestContext
  ): Promise<RegulatoryBody_PL> {
    const entity = await this.findById(id, _ctx)
    entity.lock()
    return this.repository.save(entity, _ctx)
  }

  async unlock(
    id: string,
    _ctx: RequestContext
  ): Promise<RegulatoryBody_PL> {
    const entity = await this.findById(id, _ctx)
    entity.unlock()
    return this.repository.save(entity, _ctx)
  }
}
