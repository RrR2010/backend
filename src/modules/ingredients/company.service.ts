import { Injectable } from '@nestjs/common'
import {
  CompanyRepository,
  CompanyFilter
} from '@ingredients/company.repository'
import { Company, CreateCompanyProps } from '@ingredients/company.entity'
import {
  CompanyNotFoundError,
  CompanyAlreadyExistsError
} from '@ingredients/company.errors'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { Prisma } from '@prisma/client'

@Injectable()
export class CompanyService {
  constructor(private readonly repository: CompanyRepository) {}

  async create(
    props: CreateCompanyProps,
    ctx: RequestContext
  ): Promise<Company> {
    // TODO: zod validate input
    const tenantId =
      ctx.scope === UserScope.TENANT ? ctx.tenantId : props.tenantId
    const company = Company.create({ ...props, tenantId })
    try {
      return await this.repository.save(company, ctx)
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        // taxId can be null; only throw AlreadyExistsError if taxId was provided
        if (props.taxId) {
          throw new CompanyAlreadyExistsError(props.taxId, tenantId)
        }
      }
      throw error
    }
  }

  async findAll(
    filter: CompanyFilter,
    ctx: RequestContext
  ): Promise<Company[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(id: string, ctx: RequestContext): Promise<Company> {
    const company = await this.repository.findById(id, ctx)
    if (!company) {
      throw new CompanyNotFoundError(id)
    }
    return company
  }

  async save(company: Company, ctx: RequestContext): Promise<Company> {
    try {
      return await this.repository.save(company, ctx)
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const taxId = company.taxId
        if (taxId) {
          throw new CompanyAlreadyExistsError(taxId, company.tenantId)
        }
      }
      throw error
    }
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const company = await this.findById(id, ctx)
    company.delete()
    await this.repository.save(company, ctx)
  }

  async activate(id: string, ctx: RequestContext): Promise<Company> {
    const company = await this.findById(id, ctx)
    company.activate()
    return this.repository.save(company, ctx)
  }

  async lock(id: string, ctx: RequestContext): Promise<Company> {
    const company = await this.findById(id, ctx)
    company.lock()
    return this.repository.save(company, ctx)
  }

  async unlock(id: string, ctx: RequestContext): Promise<Company> {
    const company = await this.findById(id, ctx)
    company.unlock()
    return this.repository.save(company, ctx)
  }
}
