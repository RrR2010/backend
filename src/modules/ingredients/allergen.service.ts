import { Injectable } from '@nestjs/common'
import { AllergenRepository, AllergenFilter } from '@ingredients/allergen.repository'
import { Allergen, CreateAllergenProps } from '@ingredients/allergen.entity'
import { AllergenNotFoundError, AllergenAlreadyExistsError } from '@ingredients/allergen.errors'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { Prisma } from '@prisma/client'

@Injectable()
export class AllergenService {
  constructor(private readonly repository: AllergenRepository) {}

  async create(props: CreateAllergenProps, ctx: RequestContext): Promise<Allergen> {
    // TODO: zod validate input
    const tenantId = ctx.scope === UserScope.TENANT ? ctx.tenantId : props.tenantId
    const allergen = Allergen.create({ ...props, tenantId })
    try {
      return await this.repository.save(allergen, ctx)
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new AllergenAlreadyExistsError(props.name, tenantId)
      }
      throw error
    }
  }

  async findAll(filter: AllergenFilter, ctx: RequestContext): Promise<Allergen[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(id: string, ctx: RequestContext): Promise<Allergen> {
    const allergen = await this.repository.findById(id, ctx)
    if (!allergen) {
      throw new AllergenNotFoundError(id)
    }
    return allergen
  }

  async save(allergen: Allergen, ctx: RequestContext): Promise<Allergen> {
    return this.repository.save(allergen, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const allergen = await this.findById(id, ctx)
    allergen.delete()
    await this.repository.save(allergen, ctx)
  }

  async activate(id: string, ctx: RequestContext): Promise<Allergen> {
    const allergen = await this.findById(id, ctx)
    allergen.activate()
    return this.repository.save(allergen, ctx)
  }

  async lock(id: string, ctx: RequestContext): Promise<Allergen> {
    const allergen = await this.findById(id, ctx)
    allergen.lock()
    return this.repository.save(allergen, ctx)
  }
}
