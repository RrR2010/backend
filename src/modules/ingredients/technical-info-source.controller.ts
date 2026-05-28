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
  CreateTechnicalInfoSourceDto,
  CreateTechnicalInfoSourceResponseDto,
  TechnicalInfoSourceResponseDto,
  UpdateTechnicalInfoSourceDto
} from '@ingredients/technical-info-source.dto'
import { TechnicalInfoSourceService } from '@ingredients/technical-info-source.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { TechnicalInfoSource } from '@ingredients/technical-info-source.entity'

@ApiTags('TechnicalInfoSources')
@ApiBearerAuth('accessToken')
@Controller('technical-info-sources')
export class TechnicalInfoSourcesController {
  constructor(private readonly service: TechnicalInfoSourceService) {}

  @Post()
  @Authorize(Action.Create, TechnicalInfoSource)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateTechnicalInfoSourceDto,
    @Req() request: Request
  ): Promise<CreateTechnicalInfoSourceResponseDto> {
    const source = await this.service.create(
      {
        tenantId: dto.tenantId,
        sourceType: dto.sourceType,
        referenceName: dto.referenceName,
        url: dto.url ?? null,
        documentRef: dto.documentRef ?? null
      },
      request.context
    )
    return CreateTechnicalInfoSourceResponseDto.fromDomain(source)
  }

  @Get()
  @Authorize(Action.Read, TechnicalInfoSource)
  async findAll(@Req() request: Request): Promise<TechnicalInfoSourceResponseDto[]> {
    const sources = await this.service.findAll({}, request.context)
    return sources.map(TechnicalInfoSourceResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, TechnicalInfoSource)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<TechnicalInfoSourceResponseDto> {
    const source = await this.service.findById(id, request.context)
    return TechnicalInfoSourceResponseDto.fromDomain(source)
  }

  @Patch(':id')
  @Authorize(Action.Update, TechnicalInfoSource)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTechnicalInfoSourceDto,
    @Req() request: Request
  ): Promise<TechnicalInfoSourceResponseDto> {
    const source = await this.service.findById(id, request.context)

    if (dto.sourceType) source.changeSourceType(dto.sourceType)
    if (dto.referenceName) source.changeReferenceName(dto.referenceName)
    if (dto.url !== undefined) source.changeUrl(dto.url)
    if (dto.documentRef !== undefined) source.changeDocumentRef(dto.documentRef)

    const saved = await this.service.save(source, request.context)
    return TechnicalInfoSourceResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, TechnicalInfoSource)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, TechnicalInfoSource)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<TechnicalInfoSourceResponseDto> {
    const source = await this.service.activate(id, request.context)
    return TechnicalInfoSourceResponseDto.fromDomain(source)
  }

  @Post(':id/lock')
  @Authorize(Action.Update, TechnicalInfoSource)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<TechnicalInfoSourceResponseDto> {
    const source = await this.service.lock(id, request.context)
    return TechnicalInfoSourceResponseDto.fromDomain(source)
  }

  @Post(':id/unlock')
  @Authorize(Action.Unlock, TechnicalInfoSource)
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<TechnicalInfoSourceResponseDto> {
    const source = await this.service.unlock(id, request.context)
    return TechnicalInfoSourceResponseDto.fromDomain(source)
  }
}
