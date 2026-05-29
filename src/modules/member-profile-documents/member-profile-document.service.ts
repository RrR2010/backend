import { Injectable } from '@nestjs/common'
import {
  MemberProfileDocumentRepository,
  MemberProfileDocumentFilter
} from '@member-profile-documents/member-profile-document.repository'
import {
  MemberProfileDocument,
  CreateMemberProfileDocumentProps
} from '@member-profile-documents/member-profile-document.entity'
import { MemberProfileDocumentNotFoundError } from '@member-profile-documents/member-profile-document.errors'
import { RequestContext } from '@authorization/authorization.types'

@Injectable()
export class MemberProfileDocumentService {
  constructor(private readonly repository: MemberProfileDocumentRepository) {}

  async create(
    props: CreateMemberProfileDocumentProps,
    ctx: RequestContext
  ): Promise<MemberProfileDocument> {
    const document = MemberProfileDocument.create(props)
    return this.repository.save(document, ctx)
  }

  async findAll(
    filter: MemberProfileDocumentFilter,
    ctx: RequestContext
  ): Promise<MemberProfileDocument[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<MemberProfileDocument> {
    const document = await this.repository.findById(id, ctx)
    if (!document) {
      throw new MemberProfileDocumentNotFoundError(id)
    }
    return document
  }

  async save(
    document: MemberProfileDocument,
    ctx: RequestContext
  ): Promise<MemberProfileDocument> {
    return this.repository.save(document, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const document = await this.findById(id, ctx)
    document.delete()
    await this.repository.save(document, ctx)
  }

  async activate(
    id: string,
    ctx: RequestContext
  ): Promise<MemberProfileDocument> {
    const document = await this.findById(id, ctx)
    document.activate()
    return this.repository.save(document, ctx)
  }

  async lock(id: string, ctx: RequestContext): Promise<MemberProfileDocument> {
    const document = await this.findById(id, ctx)
    document.lock()
    return this.repository.save(document, ctx)
  }
}
