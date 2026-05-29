import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { MemberProfileDocument } from '@member-profile-documents/member-profile-document.entity'
import {
  MemberProfileDocument as PrismaMemberProfileDocument,
  Prisma
} from '@prisma/client'
import { DocumentType } from '@shared/enums'
import { SystemState } from '@shared/behaviours/lockable'
import { DocumentType as PrismaDocumentType } from '@prisma/client'
import { Id } from '@shared/value-objects'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'

export interface MemberProfileDocumentFilter {
  memberProfileId?: string
  type?: DocumentType
}

export abstract class MemberProfileDocumentRepository {
  abstract findById(
    id: string,
    ctx: RequestContext
  ): Promise<MemberProfileDocument | null>
  abstract findAll(
    filter: MemberProfileDocumentFilter,
    ctx: RequestContext
  ): Promise<MemberProfileDocument[]>
  abstract save(
    document: MemberProfileDocument,
    ctx: RequestContext
  ): Promise<MemberProfileDocument>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaMemberProfileDocumentRepository implements MemberProfileDocumentRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<MemberProfileDocument | null> {
    const where: Prisma.MemberProfileDocumentWhereUniqueInput = { id }
    if (ctx.scope === UserScope.TENANT)
      where.memberProfile = { tenantMembership: { tenantId: ctx.tenantId } }
    const document = await this.prismaService.memberProfileDocument.findUnique({
      where
    })
    if (!document) return null
    return PrismaMemberProfileDocumentMapper.toDomain(document)
  }

  async findAll(
    filter: MemberProfileDocumentFilter,
    ctx: RequestContext
  ): Promise<MemberProfileDocument[]> {
    const where: Record<string, unknown> = {}
    if (filter.memberProfileId) where.memberProfileId = filter.memberProfileId
    if (filter.type) where.type = filter.type
    if (ctx.scope === UserScope.TENANT) {
      where.memberProfile = { tenantMembership: { tenantId: ctx.tenantId } }
    }

    const documents = await this.prismaService.memberProfileDocument.findMany({
      where
    })
    return documents.map(PrismaMemberProfileDocumentMapper.toDomain)
  }

  async save(
    document: MemberProfileDocument,
    ctx: RequestContext
  ): Promise<MemberProfileDocument> {
    const data = PrismaMemberProfileDocumentMapper.toPersistence(document)
    const where: Prisma.MemberProfileDocumentWhereUniqueInput = {
      id: document.id.value
    }
    if (ctx.scope === UserScope.TENANT) {
      where.memberProfile = { tenantMembership: { tenantId: ctx.tenantId } }
    }
    try {
      await this.prismaService.memberProfileDocument.upsert({
        where,
        update: {
          value: data.value,
          normalizedValue: data.normalizedValue,
          systemState: data.systemState,
          updatedAt: data.updatedAt
        },
        create: data
      })
    } catch (error) {
      if (
        ctx.scope === UserScope.TENANT &&
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ForbiddenException(
          'Cannot modify resource outside your tenant'
        )
      }
      throw error
    }
    return document
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.MemberProfileDocumentWhereUniqueInput = { id }
    if (ctx.scope === UserScope.TENANT) {
      where.memberProfile = { tenantMembership: { tenantId: ctx.tenantId } }
    }
    await this.prismaService.memberProfileDocument.delete({ where })
  }
}

class PrismaMemberProfileDocumentMapper {
  static toDomain(
    document: PrismaMemberProfileDocument
  ): MemberProfileDocument {
    return MemberProfileDocument.rehydrate({
      id: Id.from(document.id),
      memberProfileId: document.memberProfileId,
      type: document.type as DocumentType,
      value: document.value,
      normalizedValue: document.normalizedValue,
      systemState:
        SystemState[document.systemState as keyof typeof SystemState],
      createdAt: document.createdAt,
      updatedAt: document.updatedAt
    })
  }

  static toPersistence(
    document: MemberProfileDocument
  ): PrismaMemberProfileDocument {
    return {
      id: document.id.value,
      memberProfileId: document.memberProfileId,
      type: document.type as PrismaDocumentType,
      value: document.value,
      normalizedValue: document.normalizedValue,
      systemState: document.systemState,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt
    }
  }
}
