import { Injectable } from '@nestjs/common'
import { Regulation_PLRepository } from '@ingredients/regulation-pl.repository'
import {
  Regulation_PL,
  CreateRegulationPLProps
} from '@ingredients/regulation-pl.entity'
import { Regulation_PLNotFoundError } from '@ingredients/regulation-pl.errors'
import { RequestContext } from '@authorization/authorization.types'

@Injectable()
export class Regulation_PLService {
  constructor(
    private readonly repository: Regulation_PLRepository
  ) {}

  async create(
    props: CreateRegulationPLProps,
    _ctx: RequestContext
  ): Promise<Regulation_PL> {
    const entity = Regulation_PL.create(props)
    return this.repository.save(entity, _ctx)
  }

  async findAll(_ctx: RequestContext): Promise<Regulation_PL[]> {
    return this.repository.findAll({}, _ctx)
  }

  async findById(
    id: string,
    _ctx: RequestContext
  ): Promise<Regulation_PL> {
    const entity = await this.repository.findById(id, _ctx)
    if (!entity) {
      throw new Regulation_PLNotFoundError()
    }
    return entity
  }

  async findByRegulatoryBody(
    regulatoryBodyId: string,
    _ctx: RequestContext
  ): Promise<Regulation_PL[]> {
    return this.repository.findByRegulatoryBody(regulatoryBodyId, _ctx)
  }

  async findByRegulationType(
    regulationTypeId: string,
    _ctx: RequestContext
  ): Promise<Regulation_PL[]> {
    return this.repository.findByRegulationType(regulationTypeId, _ctx)
  }

  async save(
    entity: Regulation_PL,
    _ctx: RequestContext
  ): Promise<Regulation_PL> {
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
  ): Promise<Regulation_PL> {
    const entity = await this.findById(id, _ctx)
    entity.activate()
    return this.repository.save(entity, _ctx)
  }

  async lock(
    id: string,
    _ctx: RequestContext
  ): Promise<Regulation_PL> {
    const entity = await this.findById(id, _ctx)
    entity.lock()
    return this.repository.save(entity, _ctx)
  }

  async unlock(
    id: string,
    _ctx: RequestContext
  ): Promise<Regulation_PL> {
    const entity = await this.findById(id, _ctx)
    entity.unlock()
    return this.repository.save(entity, _ctx)
  }
}
