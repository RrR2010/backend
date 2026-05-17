import { Module } from '@nestjs/common'

import { MemberProfileDocumentRepository, PrismaMemberProfileDocumentRepository } from '@member-profile-documents/member-profile-document.repository'
import { MemberProfileDocumentService } from '@member-profile-documents/member-profile-document.service'
import { MemberProfileDocumentsController } from '@member-profile-documents/member-profile-document.controller'

@Module({
  imports: [],

  controllers: [MemberProfileDocumentsController],

  providers: [
    MemberProfileDocumentService,
    PrismaMemberProfileDocumentRepository,
    {
      provide: MemberProfileDocumentRepository,
      useExisting: PrismaMemberProfileDocumentRepository
    }
  ],

  exports: [MemberProfileDocumentRepository, MemberProfileDocumentService]
})
export class MemberProfileDocumentModule {}