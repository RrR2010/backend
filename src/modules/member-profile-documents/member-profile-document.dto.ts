import { ApiProperty } from '@nestjs/swagger'
import { MemberProfileDocument } from '@member-profile-documents/member-profile-document.entity'
import { DocumentType } from '@shared/enums'

export class CreateMemberProfileDocumentDto {
  @ApiProperty({ type: String })
  memberProfileId!: string

  @ApiProperty({ enum: DocumentType })
  type!: DocumentType

  @ApiProperty({ type: String })
  value!: string
}

export class CreateMemberProfileDocumentResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  memberProfileId!: string

  @ApiProperty({ enum: DocumentType })
  type!: DocumentType

  @ApiProperty()
  value!: string

  @ApiProperty()
  normalizedValue!: string

  @ApiProperty()
  systemState!: string

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  static fromDomain(
    doc: MemberProfileDocument
  ): CreateMemberProfileDocumentResponseDto {
    return {
      id: doc.id.value,
      memberProfileId: doc.memberProfileId,
      type: doc.type,
      value: doc.value,
      normalizedValue: doc.normalizedValue,
      systemState: doc.systemState,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    }
  }
}

export class MemberProfileDocumentResponseDto extends CreateMemberProfileDocumentResponseDto {}

export class UpdateMemberProfileDocumentDto {
  @ApiProperty({ type: String, required: false })
  value?: string
}
