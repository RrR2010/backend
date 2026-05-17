import { Injectable } from '@nestjs/common'
import { MemberProfileDocumentRepository, MemberProfileDocumentFilter } from '@member-profile-documents/member-profile-document.repository'
import { MemberProfileDocument, CreateMemberProfileDocumentProps } from '@member-profile-documents/member-profile-document.entity'
import { MemberProfileDocumentNotFoundError } from '@member-profile-documents/member-profile-document.errors'
import { RequestContext } from '@authorization/authorization.types'

@Injectable()
export class MemberProfileDocumentService {
  constructor(private readonly repository: MemberProfileDocumentRepository) {}

  async create(props: CreateMemberProfileDocumentProps, context: RequestContext): Promise<MemberProfileDocument> {
    const document = MemberProfileDocument.create(props)
    return this.repository.save(document)
  }

  async findAll(filter?: MemberProfileDocumentFilter, context?: RequestContext): Promise<MemberProfileDocument[]> {
    return this.repository.findAll(filter)
  }

  async findById(id: string, context: RequestContext): Promise<MemberProfileDocument> {
    const document = await this.repository.findById(id)
    if (!document) {
      throw new MemberProfileDocumentNotFoundError(id)
    }
    return document
  }

  async save(document: MemberProfileDocument, context: RequestContext): Promise<MemberProfileDocument> {
    return this.repository.save(document)
  }

  async delete(id: string, context: RequestContext): Promise<void> {
    const document = await this.findById(id, context)
    document.delete()
    await this.repository.save(document)
  }

  async activate(id: string, context: RequestContext): Promise<MemberProfileDocument> {
    const document = await this.findById(id, context)
    document.activate()
    return this.repository.save(document)
  }

  async lock(id: string, context: RequestContext): Promise<MemberProfileDocument> {
    const document = await this.findById(id, context)
    document.lock()
    return this.repository.save(document)
  }
}