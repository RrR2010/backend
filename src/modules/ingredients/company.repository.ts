import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { Company } from '@ingredients/company.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { Id } from '@shared/value-objects'
import { Company as PrismaCompany, Prisma } from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

export type CompanyFilter = {
  name?: string
  type?: string
  taxId?: string
  systemState?: SystemState
}

export abstract class CompanyRepository {
  abstract findById(id: string, ctx: RequestContext): Promise<Company | null>
  abstract findAll(
    filter: CompanyFilter,
    ctx: RequestContext
  ): Promise<Company[]>
  abstract save(company: Company, ctx: RequestContext): Promise<Company>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaCompanyRepository implements CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, ctx: RequestContext): Promise<Company | null> {
    const where: Prisma.CompanyWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const prismaCompany = await this.prisma.company.findUnique({ where })
    if (!prismaCompany) return null
    if (
      prismaCompany &&
      effectiveTenantId &&
      prismaCompany.systemState === SystemState.HIDDEN
    ) {
      return null
    }
    return PrismaCompanyMapper.toDomain(prismaCompany)
  }

  async findAll(
    filter: CompanyFilter,
    ctx: RequestContext
  ): Promise<Company[]> {
    const where: Prisma.CompanyWhereInput = {
      ...(filter.name && {
        name: { contains: filter.name, mode: 'insensitive' }
      }),
      ...(filter.type && {
        type: { contains: filter.type, mode: 'insensitive' }
      }),
      ...(filter.taxId && { taxId: filter.taxId }),
      ...(filter.systemState && { systemState: filter.systemState })
    }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    if (effectiveTenantId) {
      where.systemState = { not: SystemState.HIDDEN }
    }
    const prismaCompanies = await this.prisma.company.findMany({
      where,
      orderBy: { name: 'asc' }
    })
    return prismaCompanies.map((company) =>
      PrismaCompanyMapper.toDomain(company)
    )
  }

  async save(company: Company, ctx: RequestContext): Promise<Company> {
    if (ctx.scope === UserScope.TENANT && company.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    const id = company.id.value
    const prismaCompany = PrismaCompanyMapper.toPersistence(company)
    await this.prisma.company.upsert({
      where: { id },
      update: prismaCompany,
      create: prismaCompany
    })
    return company
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.CompanyWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    await this.prisma.company.update({
      where,
      data: { systemState: SystemState.HIDDEN, updatedAt: new Date() }
    })
  }
}

class PrismaCompanyMapper {
  static toDomain(prismaCompany: PrismaCompany): Company {
    const systemState =
      SystemState[prismaCompany.systemState as keyof typeof SystemState]
    if (!systemState) {
      throw new Error(`Invalid systemState value: ${prismaCompany.systemState}`)
    }
    return Company.rehydrate({
      id: Id.from(prismaCompany.id),
      createdAt: prismaCompany.createdAt,
      updatedAt: prismaCompany.updatedAt,
      systemState,
      tenantId: prismaCompany.tenantId,
      name: prismaCompany.name,
      type: prismaCompany.type,
      contactInfo: prismaCompany.contactInfo,
      taxId: prismaCompany.taxId
    })
  }

  static toPersistence(company: Company): Prisma.CompanyUncheckedCreateInput {
    return {
      id: company.id.value,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
      systemState: company.systemState,
      tenantId: company.tenantId,
      name: company.name,
      type: company.type,
      contactInfo: company.contactInfo,
      taxId: company.taxId
    }
  }
}
