import { Injectable } from '@nestjs/common'
import { LabelField_PLRepository } from '@products/label-field-pl.repository'
import {
  LabelField_PL,
  CreateLabelFieldPLProps
} from '@products/label-field-pl.entity'
import { LabelField_PLNotFoundError } from '@products/label-field-pl.errors'
import { RequestContext } from '@authorization/authorization.types'

@Injectable()
export class LabelField_PLService {
  constructor(private readonly repository: LabelField_PLRepository) {}

  async create(
    props: CreateLabelFieldPLProps,
    _ctx: RequestContext
  ): Promise<LabelField_PL> {
    const labelField = LabelField_PL.create(props)
    return this.repository.save(labelField, _ctx)
  }

  async findAll(_ctx: RequestContext): Promise<LabelField_PL[]> {
    return this.repository.findAll({}, _ctx)
  }

  async findById(
    id: string,
    _ctx: RequestContext
  ): Promise<LabelField_PL> {
    const labelField = await this.repository.findById(id, _ctx)
    if (!labelField) {
      throw new LabelField_PLNotFoundError()
    }
    return labelField
  }

  async save(
    labelField: LabelField_PL,
    _ctx: RequestContext
  ): Promise<LabelField_PL> {
    return this.repository.save(labelField, _ctx)
  }

  async delete(id: string, _ctx: RequestContext): Promise<void> {
    const labelField = await this.findById(id, _ctx)
    labelField.delete()
    await this.repository.save(labelField, _ctx)
  }

  async activate(
    id: string,
    _ctx: RequestContext
  ): Promise<LabelField_PL> {
    const labelField = await this.findById(id, _ctx)
    labelField.activate()
    return this.repository.save(labelField, _ctx)
  }

  async lock(id: string, _ctx: RequestContext): Promise<LabelField_PL> {
    const labelField = await this.findById(id, _ctx)
    labelField.lock()
    return this.repository.save(labelField, _ctx)
  }

  async unlock(id: string, _ctx: RequestContext): Promise<LabelField_PL> {
    const labelField = await this.findById(id, _ctx)
    labelField.unlock()
    return this.repository.save(labelField, _ctx)
  }
}
