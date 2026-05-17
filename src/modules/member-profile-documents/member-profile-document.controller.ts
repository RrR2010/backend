import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Patch,
  ParseUUIDPipe,
  Req
} from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import {
  CreateMemberProfileDocumentDto,
  CreateMemberProfileDocumentResponseDto,
  MemberProfileDocumentResponseDto,
  UpdateMemberProfileDocumentDto
} from '@member-profile-documents/member-profile-document.dto'
import { MemberProfileDocumentService } from '@member-profile-documents/member-profile-document.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import type { RequestContext } from '@authorization/authorization.types'
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
    @Body() dto: CreateMemberProfileDocumentDto,
    @Req() request: Request
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
      request.context
    )
    return CreateMemberProfileDocumentResponseDto.fromDomain(doc)
  }

  @Get()
  @Authorize(Action.Read, 'MemberProfileDocument')
  async findAll(@Req() request: Request): Promise<MemberProfileDocumentResponseDto[]> {
    const docs = await this.service.findAll({}, request.context)
    return docs.map(MemberProfileDocumentResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, 'MemberProfileDocument')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<MemberProfileDocumentResponseDto> {
    const doc = await this.service.findById(id, request.context)
    return MemberProfileDocumentResponseDto.fromDomain(doc)
  }

  @Patch(':id')
  @Authorize(Action.Update, 'MemberProfileDocument')
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMemberProfileDocumentDto,
    @Req() request: Request
  ): Promise<MemberProfileDocumentResponseDto> {
    const doc = await this.service.findById(id, request.context)

    if (dto.value) {
      const normalizedValue = dto.value.replace(/[^\d]/g, '')
      doc.changeValue(dto.value, normalizedValue)
    }

    const saved = await this.service.save(doc, request.context)
    return MemberProfileDocumentResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, 'MemberProfileDocument')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, 'MemberProfileDocument')
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<MemberProfileDocumentResponseDto> {
    const doc = await this.service.activate(id, request.context)
    return MemberProfileDocumentResponseDto.fromDomain(doc)
  }

  @Post(':id/lock')
  @Authorize(Action.Update, 'MemberProfileDocument')
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<MemberProfileDocumentResponseDto> {
    const doc = await this.service.lock(id, request.context)
    return MemberProfileDocumentResponseDto.fromDomain(doc)
  }
}
