import { Injectable } from '@nestjs/common'
import { OgmDonorSpecies_PLRepository } from '@ingredients/ogm-donor-species-pl.repository'
import {
  OgmDonorSpecies_PL,
  CreateOgmDonorSpeciesPLProps
} from '@ingredients/ogm-donor-species-pl.entity'
import { OgmDonorSpecies_PLNotFoundError } from '@ingredients/ogm-donor-species-pl.errors'
import { RequestContext } from '@authorization/authorization.types'

@Injectable()
export class OgmDonorSpecies_PLService {
  constructor(
    private readonly repository: OgmDonorSpecies_PLRepository
  ) {}

  async create(
    props: CreateOgmDonorSpeciesPLProps,
    _ctx: RequestContext
  ): Promise<OgmDonorSpecies_PL> {
    const species = OgmDonorSpecies_PL.create(props)
    return this.repository.save(species, _ctx)
  }

  async findAll(_ctx: RequestContext): Promise<OgmDonorSpecies_PL[]> {
    return this.repository.findAll({}, _ctx)
  }

  async findById(
    id: string,
    _ctx: RequestContext
  ): Promise<OgmDonorSpecies_PL> {
    const species = await this.repository.findById(id, _ctx)
    if (!species) {
      throw new OgmDonorSpecies_PLNotFoundError()
    }
    return species
  }

  async save(
    species: OgmDonorSpecies_PL,
    _ctx: RequestContext
  ): Promise<OgmDonorSpecies_PL> {
    return this.repository.save(species, _ctx)
  }

  async delete(id: string, _ctx: RequestContext): Promise<void> {
    const species = await this.findById(id, _ctx)
    species.delete()
    await this.repository.save(species, _ctx)
  }

  async activate(
    id: string,
    _ctx: RequestContext
  ): Promise<OgmDonorSpecies_PL> {
    const species = await this.findById(id, _ctx)
    species.activate()
    return this.repository.save(species, _ctx)
  }

  async lock(
    id: string,
    _ctx: RequestContext
  ): Promise<OgmDonorSpecies_PL> {
    const species = await this.findById(id, _ctx)
    species.lock()
    return this.repository.save(species, _ctx)
  }

  async unlock(
    id: string,
    _ctx: RequestContext
  ): Promise<OgmDonorSpecies_PL> {
    const species = await this.findById(id, _ctx)
    species.unlock()
    return this.repository.save(species, _ctx)
  }
}
