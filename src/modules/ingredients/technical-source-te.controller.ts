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
  CreateTechnicalSource_TEDto,
  CreateTechnicalSource_TE_ResponseDto,
  TechnicalSource_TE_ResponseDto,
  UpdateTechnicalSource_TEDto
} from '@ingredients/technical-source-te.dto'
import { TechnicalSource_TEService } from '@ingredients/technical-source-te.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { TechnicalSource_TE } from '@ingredients/technical-source-te.entity'

@ApiTags('TechnicalSources')
@ApiBearerAuth('accessToken')
@Controller('technical-sources')
export class TechnicalSource_TEController {
  constructor(private readonly service: TechnicalSource_TEService) {}

  @Post()
  @Authorize(Action.Create, TechnicalSource_TE)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateTechnicalSource_TEDto,
    @Req() request: Request
  ): Promise<CreateTechnicalSource_TE_ResponseDto> {
    const source = await this.service.create(
      {
        tenantId: dto.tenantId,
        sourceTypePlId: dto.sourceTypePlId ?? null,
        sourceTypeTeId: dto.sourceTypeTeId ?? null,
        referenceName: dto.referenceName,
        url: dto.url ?? null,
        documentRef: dto.documentRef ?? null,
        notes: dto.notes ?? null
      },
      request.context
    )
    return CreateTechnicalSource_TE_ResponseDto.fromDomain(source)
  }

  @Get()
  @Authorize(Action.Read, TechnicalSource_TE)
  async findAll(
    @Req() request: Request
  ): Promise<TechnicalSource_TE_ResponseDto[]> {
    const sources = await this.service.findAll({}, request.context)
    return sources.map(TechnicalSource_TE_ResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, TechnicalSource_TE)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<TechnicalSource_TE_ResponseDto> {
    const source = await this.service.findById(id, request.context)
    return TechnicalSource_TE_ResponseDto.fromDomain(source)
  }

  @Patch(':id')
  @Authorize(Action.Update, TechnicalSource_TE)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTechnicalSource_TEDto,
    @Req() request: Request
  ): Promise<TechnicalSource_TE_ResponseDto> {
    const source = await this.service.findById(id, request.context)

    if (dto.sourceTypePlId !== undefined || dto.sourceTypeTeId !== undefined) {
      source.changeSourceType(
        dto.sourceTypePlId ?? null,
        dto.sourceTypeTeId ?? null
      )
    }
    if (dto.referenceName) source.changeReferenceName(dto.referenceName)
    if (dto.url !== undefined) source.changeUrl(dto.url)
    if (dto.documentRef !== undefined) source.changeDocumentRef(dto.documentRef)
    if (dto.notes !== undefined) source.changeNotes(dto.notes)

    const saved = await this.service.save(source, request.context)
    return TechnicalSource_TE_ResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, TechnicalSource_TE)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, TechnicalSource_TE)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<TechnicalSource_TE_ResponseDto> {
    const source = await this.service.activate(id, request.context)
    return TechnicalSource_TE_ResponseDto.fromDomain(source)
  }

  @Post(':id/lock')
  @Authorize(Action.Update, TechnicalSource_TE)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<TechnicalSource_TE_ResponseDto> {
    const source = await this.service.lock(id, request.context)
    return TechnicalSource_TE_ResponseDto.fromDomain(source)
  }

  @Post(':id/unlock')
  @Authorize(Action.Unlock, TechnicalSource_TE)
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<TechnicalSource_TE_ResponseDto> {
    const source = await this.service.unlock(id, request.context)
    return TechnicalSource_TE_ResponseDto.fromDomain(source)
  }
}
