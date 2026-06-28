import { Injectable } from '@nestjs/common'
import { DeclarationFlag_PLRepository } from '@ingredients/declaration-flag-pl.repository'
import {
  DeclarationFlag_PL,
  CreateDeclarationFlagPLProps
} from '@ingredients/declaration-flag-pl.entity'
import { DeclarationFlag_PLNotFoundError } from '@ingredients/declaration-flag-pl.errors'
import { RequestContext } from '@authorization/authorization.types'

@Injectable()
export class DeclarationFlag_PLService {
  constructor(
    private readonly repository: DeclarationFlag_PLRepository
  ) {}

  async create(
    props: CreateDeclarationFlagPLProps,
    _ctx: RequestContext
  ): Promise<DeclarationFlag_PL> {
    const flag = DeclarationFlag_PL.create(props)
    return this.repository.save(flag, _ctx)
  }

  async findAll(_ctx: RequestContext): Promise<DeclarationFlag_PL[]> {
    return this.repository.findAll({}, _ctx)
  }

  async findById(
    id: string,
    _ctx: RequestContext
  ): Promise<DeclarationFlag_PL> {
    const flag = await this.repository.findById(id, _ctx)
    if (!flag) {
      throw new DeclarationFlag_PLNotFoundError()
    }
    return flag
  }

  async save(
    flag: DeclarationFlag_PL,
    _ctx: RequestContext
  ): Promise<DeclarationFlag_PL> {
    return this.repository.save(flag, _ctx)
  }

  async delete(id: string, _ctx: RequestContext): Promise<void> {
    const flag = await this.findById(id, _ctx)
    flag.delete()
    await this.repository.save(flag, _ctx)
  }

  async activate(
    id: string,
    _ctx: RequestContext
  ): Promise<DeclarationFlag_PL> {
    const flag = await this.findById(id, _ctx)
    flag.activate()
    return this.repository.save(flag, _ctx)
  }

  async lock(
    id: string,
    _ctx: RequestContext
  ): Promise<DeclarationFlag_PL> {
    const flag = await this.findById(id, _ctx)
    flag.lock()
    return this.repository.save(flag, _ctx)
  }

  async unlock(
    id: string,
    _ctx: RequestContext
  ): Promise<DeclarationFlag_PL> {
    const flag = await this.findById(id, _ctx)
    flag.unlock()
    return this.repository.save(flag, _ctx)
  }
}
