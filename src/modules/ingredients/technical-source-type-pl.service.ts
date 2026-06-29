import { Injectable } from '@nestjs/common'
import { TechnicalSourceType_PLRepository, TechnicalSourceType_PLFilter } from '@ingredients/technical-source-type-pl.repository'
import {
  TechnicalSourceType_PL,
  CreateTechnicalSourceTypePLProps
} from '@ingredients/technical-source-type-pl.entity'
import { TechnicalSourceType_PLNotFoundError } from '@ingredients/technical-source-type-pl.errors'
import { RequestContext } from '@authorization/authorization.types'

@Injectable()
export class TechnicalSourceType_PLService {
  constructor(
    private readonly repository: TechnicalSourceType_PLRepository
  ) {}

  async create(
    props: CreateTechnicalSourceTypePLProps,
    _ctx: RequestContext
  ): Promise<TechnicalSourceType_PL> {
    const type = TechnicalSourceType_PL.create(props)
    return this.repository.save(type, _ctx)
  }

  async findAll(filter: TechnicalSourceType_PLFilter, _ctx: RequestContext): Promise<TechnicalSourceType_PL[]> {
    return this.repository.findAll(filter, _ctx)
  }

  async findById(
    id: string,
    _ctx: RequestContext
  ): Promise<TechnicalSourceType_PL> {
    const type = await this.repository.findById(id, _ctx)
    if (!type) {
      throw new TechnicalSourceType_PLNotFoundError()
    }
    return type
  }

  async save(
    type: TechnicalSourceType_PL,
    _ctx: RequestContext
  ): Promise<TechnicalSourceType_PL> {
    return this.repository.save(type, _ctx)
  }

  async delete(id: string, _ctx: RequestContext): Promise<void> {
    const type = await this.findById(id, _ctx)
    type.delete()
    await this.repository.save(type, _ctx)
  }

  async activate(
    id: string,
    _ctx: RequestContext
  ): Promise<TechnicalSourceType_PL> {
    const type = await this.findById(id, _ctx)
    type.activate()
    return this.repository.save(type, _ctx)
  }

  async lock(
    id: string,
    _ctx: RequestContext
  ): Promise<TechnicalSourceType_PL> {
    const type = await this.findById(id, _ctx)
    type.lock()
    return this.repository.save(type, _ctx)
  }

  async unlock(
    id: string,
    _ctx: RequestContext
  ): Promise<TechnicalSourceType_PL> {
    const type = await this.findById(id, _ctx)
    type.unlock()
    return this.repository.save(type, _ctx)
  }
}
