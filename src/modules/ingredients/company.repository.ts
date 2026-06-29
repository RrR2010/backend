import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { Company_TE } from '@ingredients/company.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { Id } from '@shared/value-objects'
import { Company_TE as PrismaCompany_TE, Prisma } from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

export type CompanyFilter = {
  name?: string
  type?: string
  taxId?: string
  systemState?: SystemState
  skip?: number
  take?: number
}

export abstract class CompanyRepository {
  abstract findById(id: string, ctx: RequestContext): Promise<Company_TE | null>
  abstract findAll(
    filter: CompanyFilter,
    ctx: RequestContext
  ): Promise<Company_TE[]>
  abstract save(company: Company_TE, ctx: RequestContext): Promise<Company_TE>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaCompany_TERepository implements CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, ctx: RequestContext): Promise<Company_TE | null> {
    const where: Prisma.Company_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const prismaCompany = await this.prisma.company_TE.findUnique({ where })
    if (!prismaCompany) return null
    if (
      prismaCompany &&
      effectiveTenantId &&
      prismaCompany.systemState === SystemState.DELETED
    ) {
      return null
    }
    return PrismaCompany_TEMapper.toDomain(prismaCompany)
  }

  async findAll(
    filter: CompanyFilter,
    ctx: RequestContext
  ): Promise<Company_TE[]> {
    const where: Prisma.Company_TEWhereInput = {
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
      where.systemState = { not: SystemState.DELETED }
    }
    const prismaCompanies = await this.prisma.company_TE.findMany({
      where,
      skip: filter.skip ?? 0,
      take: filter.take ?? 100,
      orderBy: { name: 'asc' }
    })
    return prismaCompanies.map((company) =>
      PrismaCompany_TEMapper.toDomain(company)
    )
  }

  async save(company: Company_TE, ctx: RequestContext): Promise<Company_TE> {
    if (ctx.scope === UserScope.TENANT && company.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    const id = company.id.value
    const prismaCompany = PrismaCompany_TEMapper.toPersistence(company)
    await this.prisma.company_TE.upsert({
      where: { id },
      update: prismaCompany,
      create: prismaCompany
    })
    return company
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.Company_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    await this.prisma.company_TE.update({
      where,
      data: { systemState: SystemState.DELETED, updatedAt: new Date() }
    })
  }
}

class PrismaCompany_TEMapper {
  static toDomain(prismaCompany: PrismaCompany_TE): Company_TE {
    const systemState =
      SystemState[prismaCompany.systemState as keyof typeof SystemState]
    if (!systemState) {
      throw new Error(`Invalid systemState value: ${prismaCompany.systemState}`)
    }
    return Company_TE.rehydrate({
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

  static toPersistence(company: Company_TE): Prisma.Company_TEUncheckedCreateInput {
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
