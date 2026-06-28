import { Injectable } from '@nestjs/common'
import { PanelGeometricFormatType_PLRepository } from '@products/panel-geometric-format-type-pl.repository'
import {
  PanelGeometricFormatType_PL,
  CreatePanelGeometricFormatTypePLProps
} from '@products/panel-geometric-format-type-pl.entity'
import { PanelGeometricFormatType_PLNotFoundError } from '@products/panel-geometric-format-type-pl.errors'
import { RequestContext } from '@authorization/authorization.types'

@Injectable()
export class PanelGeometricFormatType_PLService {
  constructor(
    private readonly repository: PanelGeometricFormatType_PLRepository
  ) {}

  async create(
    props: CreatePanelGeometricFormatTypePLProps,
    _ctx: RequestContext
  ): Promise<PanelGeometricFormatType_PL> {
    const format = PanelGeometricFormatType_PL.create(props)
    return this.repository.save(format, _ctx)
  }

  async findAll(
    _ctx: RequestContext
  ): Promise<PanelGeometricFormatType_PL[]> {
    return this.repository.findAll({}, _ctx)
  }

  async findById(
    id: string,
    _ctx: RequestContext
  ): Promise<PanelGeometricFormatType_PL> {
    const format = await this.repository.findById(id, _ctx)
    if (!format) {
      throw new PanelGeometricFormatType_PLNotFoundError()
    }
    return format
  }

  async save(
    format: PanelGeometricFormatType_PL,
    _ctx: RequestContext
  ): Promise<PanelGeometricFormatType_PL> {
    return this.repository.save(format, _ctx)
  }

  async delete(id: string, _ctx: RequestContext): Promise<void> {
    const format = await this.findById(id, _ctx)
    format.delete()
    await this.repository.save(format, _ctx)
  }

  async activate(
    id: string,
    _ctx: RequestContext
  ): Promise<PanelGeometricFormatType_PL> {
    const format = await this.findById(id, _ctx)
    format.activate()
    return this.repository.save(format, _ctx)
  }

  async lock(
    id: string,
    _ctx: RequestContext
  ): Promise<PanelGeometricFormatType_PL> {
    const format = await this.findById(id, _ctx)
    format.lock()
    return this.repository.save(format, _ctx)
  }

  async unlock(
    id: string,
    _ctx: RequestContext
  ): Promise<PanelGeometricFormatType_PL> {
    const format = await this.findById(id, _ctx)
    format.unlock()
    return this.repository.save(format, _ctx)
  }
}
