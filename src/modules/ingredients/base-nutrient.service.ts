import { Injectable } from '@nestjs/common'
import { BaseNutrientRepository } from '@ingredients/base-nutrient.repository'
import {
  BaseNutrient,
  CreateBaseNutrientProps
} from '@ingredients/base-nutrient.entity'
import { BaseNutrientNotFoundError } from '@ingredients/base-nutrient.errors'
import { RequestContext } from '@authorization/authorization.types'

@Injectable()
export class BaseNutrientService {
  constructor(private readonly repository: BaseNutrientRepository) {}

  async create(
    props: CreateBaseNutrientProps,
    _ctx: RequestContext
  ): Promise<BaseNutrient> {
    const nutrient = BaseNutrient.create(props)
    return this.repository.save(nutrient, _ctx)
  }

  async findAll(_ctx: RequestContext): Promise<BaseNutrient[]> {
    return this.repository.findAll({}, _ctx)
  }

  async findById(id: string, _ctx: RequestContext): Promise<BaseNutrient> {
    const nutrient = await this.repository.findById(id, _ctx)
    if (!nutrient) {
      throw new BaseNutrientNotFoundError(id)
    }
    return nutrient
  }

  async save(
    nutrient: BaseNutrient,
    _ctx: RequestContext
  ): Promise<BaseNutrient> {
    return this.repository.save(nutrient, _ctx)
  }

  async delete(id: string, _ctx: RequestContext): Promise<void> {
    const nutrient = await this.findById(id, _ctx)
    nutrient.delete()
    await this.repository.save(nutrient, _ctx)
  }

  async activate(id: string, _ctx: RequestContext): Promise<BaseNutrient> {
    const nutrient = await this.findById(id, _ctx)
    nutrient.activate()
    return this.repository.save(nutrient, _ctx)
  }

  async lock(id: string, _ctx: RequestContext): Promise<BaseNutrient> {
    const nutrient = await this.findById(id, _ctx)
    nutrient.lock()
    return this.repository.save(nutrient, _ctx)
  }

  async unlock(id: string, _ctx: RequestContext): Promise<BaseNutrient> {
    const nutrient = await this.findById(id, _ctx)
    nutrient.unlock()
    return this.repository.save(nutrient, _ctx)
  }
}
