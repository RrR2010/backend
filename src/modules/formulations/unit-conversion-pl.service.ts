import { Injectable } from '@nestjs/common'
import { UnitConversion_PLRepository } from '@formulations/unit-conversion-pl.repository'
import {
  UnitConversion_PL,
  CreateUnitConversionPLProps
} from '@formulations/unit-conversion-pl.entity'
import { UnitConversion_PLNotFoundError } from '@formulations/unit-conversion-pl.errors'
import { RequestContext } from '@authorization/authorization.types'

@Injectable()
export class UnitConversion_PLService {
  constructor(
    private readonly repository: UnitConversion_PLRepository
  ) {}

  async create(
    props: CreateUnitConversionPLProps,
    _ctx: RequestContext
  ): Promise<UnitConversion_PL> {
    const entity = UnitConversion_PL.create(props)
    return this.repository.save(entity, _ctx)
  }

  async findAll(_ctx: RequestContext): Promise<UnitConversion_PL[]> {
    return this.repository.findAll({}, _ctx)
  }

  async findById(
    id: string,
    _ctx: RequestContext
  ): Promise<UnitConversion_PL> {
    const entity = await this.repository.findById(id, _ctx)
    if (!entity) {
      throw new UnitConversion_PLNotFoundError()
    }
    return entity
  }

  async findByFromUnit(
    fromUnitId: string,
    _ctx: RequestContext
  ): Promise<UnitConversion_PL[]> {
    return this.repository.findByFromUnit(fromUnitId, _ctx)
  }

  async findByToUnit(
    toUnitId: string,
    _ctx: RequestContext
  ): Promise<UnitConversion_PL[]> {
    return this.repository.findByToUnit(toUnitId, _ctx)
  }

  async save(
    entity: UnitConversion_PL,
    _ctx: RequestContext
  ): Promise<UnitConversion_PL> {
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
  ): Promise<UnitConversion_PL> {
    const entity = await this.findById(id, _ctx)
    entity.activate()
    return this.repository.save(entity, _ctx)
  }

  async lock(id: string, _ctx: RequestContext): Promise<UnitConversion_PL> {
    const entity = await this.findById(id, _ctx)
    entity.lock()
    return this.repository.save(entity, _ctx)
  }

  async unlock(id: string, _ctx: RequestContext): Promise<UnitConversion_PL> {
    const entity = await this.findById(id, _ctx)
    entity.unlock()
    return this.repository.save(entity, _ctx)
  }
}
