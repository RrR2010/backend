import { Injectable } from '@nestjs/common'
import { RegulationType_PLRepository } from '@ingredients/regulation-type-pl.repository'
import {
  RegulationType_PL,
  CreateRegulationTypePLProps
} from '@ingredients/regulation-type-pl.entity'
import { RegulationType_PLNotFoundError } from '@ingredients/regulation-type-pl.errors'
import { RequestContext } from '@authorization/authorization.types'

@Injectable()
export class RegulationType_PLService {
  constructor(
    private readonly repository: RegulationType_PLRepository
  ) {}

  async create(
    props: CreateRegulationTypePLProps,
    _ctx: RequestContext
  ): Promise<RegulationType_PL> {
    const entity = RegulationType_PL.create(props)
    return this.repository.save(entity, _ctx)
  }

  async findAll(_ctx: RequestContext): Promise<RegulationType_PL[]> {
    return this.repository.findAll({}, _ctx)
  }

  async findById(
    id: string,
    _ctx: RequestContext
  ): Promise<RegulationType_PL> {
    const entity = await this.repository.findById(id, _ctx)
    if (!entity) {
      throw new RegulationType_PLNotFoundError()
    }
    return entity
  }

  async save(
    entity: RegulationType_PL,
    _ctx: RequestContext
  ): Promise<RegulationType_PL> {
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
  ): Promise<RegulationType_PL> {
    const entity = await this.findById(id, _ctx)
    entity.activate()
    return this.repository.save(entity, _ctx)
  }

  async lock(
    id: string,
    _ctx: RequestContext
  ): Promise<RegulationType_PL> {
    const entity = await this.findById(id, _ctx)
    entity.lock()
    return this.repository.save(entity, _ctx)
  }

  async unlock(
    id: string,
    _ctx: RequestContext
  ): Promise<RegulationType_PL> {
    const entity = await this.findById(id, _ctx)
    entity.unlock()
    return this.repository.save(entity, _ctx)
  }
}
