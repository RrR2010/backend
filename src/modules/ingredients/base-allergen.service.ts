import { Injectable } from '@nestjs/common'
import { BaseAllergenRepository } from '@ingredients/base-allergen.repository'
import {
  BaseAllergen,
  CreateBaseAllergenProps
} from '@ingredients/base-allergen.entity'
import { BaseAllergenNotFoundError } from '@ingredients/base-allergen.errors'
import { RequestContext } from '@authorization/authorization.types'

@Injectable()
export class BaseAllergenService {
  constructor(private readonly repository: BaseAllergenRepository) {}

  async create(
    props: CreateBaseAllergenProps,
    _ctx: RequestContext
  ): Promise<BaseAllergen> {
    const allergen = BaseAllergen.create(props)
    return this.repository.save(allergen, _ctx)
  }

  async findAll(_ctx: RequestContext): Promise<BaseAllergen[]> {
    return this.repository.findAll({}, _ctx)
  }

  async findById(id: string, _ctx: RequestContext): Promise<BaseAllergen> {
    const allergen = await this.repository.findById(id, _ctx)
    if (!allergen) {
      throw new BaseAllergenNotFoundError(id)
    }
    return allergen
  }

  async save(
    allergen: BaseAllergen,
    _ctx: RequestContext
  ): Promise<BaseAllergen> {
    return this.repository.save(allergen, _ctx)
  }

  async delete(id: string, _ctx: RequestContext): Promise<void> {
    const allergen = await this.findById(id, _ctx)
    allergen.delete()
    await this.repository.save(allergen, _ctx)
  }

  async activate(id: string, _ctx: RequestContext): Promise<BaseAllergen> {
    const allergen = await this.findById(id, _ctx)
    allergen.activate()
    return this.repository.save(allergen, _ctx)
  }

  async lock(id: string, _ctx: RequestContext): Promise<BaseAllergen> {
    const allergen = await this.findById(id, _ctx)
    allergen.lock()
    return this.repository.save(allergen, _ctx)
  }

  async unlock(id: string, _ctx: RequestContext): Promise<BaseAllergen> {
    const allergen = await this.findById(id, _ctx)
    allergen.unlock()
    return this.repository.save(allergen, _ctx)
  }
}
