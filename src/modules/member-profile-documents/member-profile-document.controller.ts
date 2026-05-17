import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Patch,
  ParseUUIDPipe
} from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import {
  CreateMemberProfileDocumentDto,
  CreateMemberProfileDocumentResponseDto,
  MemberProfileDocumentResponseDto,
  UpdateMemberProfileDocumentDto
} from '@member-profile-documents/member-profile-document.dto'
import { MemberProfileDocumentService } from '@member-profile-documents/member-profile-document.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { MemberProfileDocument } from '@member-profile-documents/member-profile-document.entity'

@ApiTags('Member Profile Documents')
@ApiBearerAuth('accessToken')
@Controller('member-profile-documents')
export class MemberProfileDocumentsController {
  constructor(private readonly service: MemberProfileDocumentService) {}

  @Post()
  @Authorize(Action.Create, 'MemberProfileDocument')
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateMemberProfileDocumentDto
  ): Promise<CreateMemberProfileDocumentResponseDto> {
    // Normalize value (simple implementation - could be enhanced)
    const normalizedValue = dto.value.replace(/[^\d]/g, '')

    const doc = await this.service.create(
      {
        memberProfileId: dto.memberProfileId,
        type: dto.type,
        value: dto.value,
        normalizedValue
      },
      null as any
    )
    return CreateMemberProfileDocumentResponseDto.fromDomain(doc)
  }

  @Get()
  @Authorize(Action.Read, 'MemberProfileDocument')
  async findAll(): Promise<MemberProfileDocumentResponseDto[]> {
    const docs = await this.service.findAll(undefined, null as any)
    return docs.map(MemberProfileDocumentResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, 'MemberProfileDocument')
  async findById(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<MemberProfileDocumentResponseDto> {
    const doc = await this.service.findById(id, null as any)
    return MemberProfileDocumentResponseDto.fromDomain(doc)
  }

  @Patch(':id')
  @Authorize(Action.Update, 'MemberProfileDocument')
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMemberProfileDocumentDto
  ): Promise<MemberProfileDocumentResponseDto> {
    const doc = await this.service.findById(id, null as any)

    if (dto.value) {
      const normalizedValue = dto.value.replace(/[^\d]/g, '')
      doc.changeValue(dto.value, normalizedValue)
    }

    const saved = await this.service.save(doc, null as any)
    return MemberProfileDocumentResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, 'MemberProfileDocument')
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.service.delete(id, null as any)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, 'MemberProfileDocument')
  async activate(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<MemberProfileDocumentResponseDto> {
    const doc = await this.service.activate(id, null as any)
    return MemberProfileDocumentResponseDto.fromDomain(doc)
  }

  @Post(':id/lock')
  @Authorize(Action.Update, 'MemberProfileDocument')
  async lock(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<MemberProfileDocumentResponseDto> {
    const doc = await this.service.lock(id, null as any)
    return MemberProfileDocumentResponseDto.fromDomain(doc)
  }
}