import { Injectable } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { MemberProfileDocument } from '@member-profile-documents/member-profile-document.entity'
import {
  MemberProfileDocument as PrismaMemberProfileDocument,
  Prisma
} from '@prisma/client'
import { DocumentType, SystemState } from '@shared/enums'
import { DocumentType as PrismaDocumentType } from '@prisma/client'
import { Id } from '@shared/value-objects'

export interface MemberProfileDocumentFilter {
  memberProfileId?: string
  type?: DocumentType
}

export abstract class MemberProfileDocumentRepository {
  abstract findById(id: string): Promise<MemberProfileDocument | null>
  abstract findAll(filter?: MemberProfileDocumentFilter): Promise<MemberProfileDocument[]>
  abstract save(document: MemberProfileDocument): Promise<MemberProfileDocument>
  abstract delete(id: string): Promise<void>
}

@Injectable()
export class PrismaMemberProfileDocumentRepository implements MemberProfileDocumentRepository {
  constructor(private readonly prismaService: PrismaService) {}

async findById(id: string): Promise<MemberProfileDocument | null> {
    const document = await this.prismaService.memberProfileDocument.findUnique({
      where: { id }
    })
    if (!document) return null
    return MemberProfileDocumentMapper.toDomain(document)
  }

  async findAll(filter?: MemberProfileDocumentFilter): Promise<MemberProfileDocument[]> {
    const where: Record<string, unknown> = {}
    if (filter?.memberProfileId) where.memberProfileId = filter.memberProfileId
    if (filter?.type) where.type = filter.type

    const documents = await this.prismaService.memberProfileDocument.findMany({ where })
    return documents.map(MemberProfileDocumentMapper.toDomain)
  }

  async save(document: MemberProfileDocument): Promise<MemberProfileDocument> {
    const data = PrismaMemberProfileDocumentMapper.toPersistence(document)
    await this.prismaService.memberProfileDocument.upsert({
      where: { id: document.id.value },
      update: {
        value: data.value,
        normalizedValue: data.normalizedValue,
        systemState: data.systemState,
        updatedAt: data.updatedAt
      },
      create: data
    })
    return document
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.memberProfileDocument.delete({ where: { id } })
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
