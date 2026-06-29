import { Injectable } from '@nestjs/common'
import { Allergen_PLRepository, Allergen_PLFilter } from '@ingredients/allergen-pl.repository'
import {
  Allergen_PL,
  CreateAllergenPLProps
} from '@ingredients/allergen-pl.entity'
import { Allergen_PLNotFoundError } from '@ingredients/allergen-pl.errors'
import { RequestContext } from '@authorization/authorization.types'

@Injectable()
export class Allergen_PLService {
  constructor(private readonly repository: Allergen_PLRepository) {}

  async create(
    props: CreateAllergenPLProps,
    _ctx: RequestContext
  ): Promise<Allergen_PL> {
    const allergen = Allergen_PL.create(props)
    return this.repository.save(allergen, _ctx)
  }

  async findAll(filter: Allergen_PLFilter, _ctx: RequestContext): Promise<Allergen_PL[]> {
    return this.repository.findAll(filter, _ctx)
  }

  async findById(
    id: string,
    _ctx: RequestContext
  ): Promise<Allergen_PL> {
    const allergen = await this.repository.findById(id, _ctx)
    if (!allergen) {
      throw new Allergen_PLNotFoundError()
    }
    return allergen
  }

  async save(
    allergen: Allergen_PL,
    _ctx: RequestContext
  ): Promise<Allergen_PL> {
    return this.repository.save(allergen, _ctx)
  }

  async delete(id: string, _ctx: RequestContext): Promise<void> {
    const allergen = await this.findById(id, _ctx)
    allergen.delete()
    await this.repository.save(allergen, _ctx)
  }

  async activate(
    id: string,
    _ctx: RequestContext
  ): Promise<Allergen_PL> {
    const allergen = await this.findById(id, _ctx)
    allergen.activate()
    return this.repository.save(allergen, _ctx)
  }

  async lock(id: string, _ctx: RequestContext): Promise<Allergen_PL> {
    const allergen = await this.findById(id, _ctx)
    allergen.lock()
    return this.repository.save(allergen, _ctx)
  }

  async unlock(id: string, _ctx: RequestContext): Promise<Allergen_PL> {
    const allergen = await this.findById(id, _ctx)
    allergen.unlock()
    return this.repository.save(allergen, _ctx)
  }
}
