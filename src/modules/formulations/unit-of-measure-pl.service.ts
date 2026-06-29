import { Injectable } from '@nestjs/common'
import { UnitOfMeasure_PLRepository, UnitOfMeasure_PLFilter } from '@formulations/unit-of-measure-pl.repository'
import {
  UnitOfMeasure_PL,
  CreateUnitOfMeasurePLProps
} from '@formulations/unit-of-measure-pl.entity'
import { UnitOfMeasure_PLNotFoundError } from '@formulations/unit-of-measure-pl.errors'
import { RequestContext } from '@authorization/authorization.types'

@Injectable()
export class UnitOfMeasure_PLService {
  constructor(
    private readonly repository: UnitOfMeasure_PLRepository
  ) {}

  async create(
    props: CreateUnitOfMeasurePLProps,
    _ctx: RequestContext
  ): Promise<UnitOfMeasure_PL> {
    const entity = UnitOfMeasure_PL.create(props)
    return this.repository.save(entity, _ctx)
  }

  async findAll(filter: UnitOfMeasure_PLFilter, _ctx: RequestContext): Promise<UnitOfMeasure_PL[]> {
    return this.repository.findAll(filter, _ctx)
  }

  async findById(
    id: string,
    _ctx: RequestContext
  ): Promise<UnitOfMeasure_PL> {
    const entity = await this.repository.findById(id, _ctx)
    if (!entity) {
      throw new UnitOfMeasure_PLNotFoundError()
    }
    return entity
  }

  async save(
    entity: UnitOfMeasure_PL,
    _ctx: RequestContext
  ): Promise<UnitOfMeasure_PL> {
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
  ): Promise<UnitOfMeasure_PL> {
    const entity = await this.findById(id, _ctx)
    entity.activate()
    return this.repository.save(entity, _ctx)
  }

  async lock(id: string, _ctx: RequestContext): Promise<UnitOfMeasure_PL> {
    const entity = await this.findById(id, _ctx)
    entity.lock()
    return this.repository.save(entity, _ctx)
  }

  async unlock(id: string, _ctx: RequestContext): Promise<UnitOfMeasure_PL> {
    const entity = await this.findById(id, _ctx)
    entity.unlock()
    return this.repository.save(entity, _ctx)
  }
}
