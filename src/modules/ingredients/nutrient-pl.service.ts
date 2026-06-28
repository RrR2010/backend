import { Injectable } from '@nestjs/common'
import { Nutrient_PLRepository } from '@ingredients/nutrient-pl.repository'
import {
  Nutrient_PL,
  CreateNutrientPLProps
} from '@ingredients/nutrient-pl.entity'
import { Nutrient_PLNotFoundError } from '@ingredients/nutrient-pl.errors'
import { RequestContext } from '@authorization/authorization.types'

@Injectable()
export class Nutrient_PLService {
  constructor(private readonly repository: Nutrient_PLRepository) {}

  async create(
    props: CreateNutrientPLProps,
    _ctx: RequestContext
  ): Promise<Nutrient_PL> {
    const nutrient = Nutrient_PL.create(props)
    return this.repository.save(nutrient, _ctx)
  }

  async findAll(_ctx: RequestContext): Promise<Nutrient_PL[]> {
    return this.repository.findAll({}, _ctx)
  }

  async findById(
    id: string,
    _ctx: RequestContext
  ): Promise<Nutrient_PL> {
    const nutrient = await this.repository.findById(id, _ctx)
    if (!nutrient) {
      throw new Nutrient_PLNotFoundError()
    }
    return nutrient
  }

  async save(
    nutrient: Nutrient_PL,
    _ctx: RequestContext
  ): Promise<Nutrient_PL> {
    return this.repository.save(nutrient, _ctx)
  }

  async delete(id: string, _ctx: RequestContext): Promise<void> {
    const nutrient = await this.findById(id, _ctx)
    nutrient.delete()
    await this.repository.save(nutrient, _ctx)
  }

  async activate(
    id: string,
    _ctx: RequestContext
  ): Promise<Nutrient_PL> {
    const nutrient = await this.findById(id, _ctx)
    nutrient.activate()
    return this.repository.save(nutrient, _ctx)
  }

  async lock(id: string, _ctx: RequestContext): Promise<Nutrient_PL> {
    const nutrient = await this.findById(id, _ctx)
    nutrient.lock()
    return this.repository.save(nutrient, _ctx)
  }

  async unlock(id: string, _ctx: RequestContext): Promise<Nutrient_PL> {
    const nutrient = await this.findById(id, _ctx)
    nutrient.unlock()
    return this.repository.save(nutrient, _ctx)
  }
}
