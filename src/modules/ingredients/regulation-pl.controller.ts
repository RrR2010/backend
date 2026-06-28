import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Patch,
  ParseUUIDPipe,
  Req,
  Query
} from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import {
  CreateRegulation_PLDto,
  CreateRegulation_PLResponseDto,
  Regulation_PLResponseDto,
  UpdateRegulation_PLDto
} from '@ingredients/regulation-pl.dto'
import { Regulation_PLService } from '@ingredients/regulation-pl.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { Regulation_PL } from '@ingredients/regulation-pl.entity'

@ApiTags('Regulations PL')
@ApiBearerAuth('accessToken')
@Controller('regulations-pl')
export class Regulation_PLController {
  constructor(private readonly service: Regulation_PLService) {}

  @Post()
  @Authorize(Action.Manage, Regulation_PL)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateRegulation_PLDto,
    @Req() request: Request
  ): Promise<CreateRegulation_PLResponseDto> {
    const entity = await this.service.create(
      {
        number: dto.number,
        year: dto.year,
        title: dto.title ?? null,
        publishedAt: dto.publishedAt ?? null,
        regulatoryBodyId: dto.regulatoryBodyId,
        regulationTypeId: dto.regulationTypeId
      },
      request.context
    )
    return CreateRegulation_PLResponseDto.fromDomain(entity)
  }

  @Get()
  @Authorize(Action.Read, Regulation_PL)
  async findAll(@Req() request: Request): Promise<Regulation_PLResponseDto[]> {
    const entities = await this.service.findAll(request.context)
    return entities.map((e) => Regulation_PLResponseDto.fromDomain(e))
  }

  @Get('by-regulatory-body/:regulatoryBodyId')
  @Authorize(Action.Read, Regulation_PL)
  async findByRegulatoryBody(
    @Param('regulatoryBodyId', ParseUUIDPipe) regulatoryBodyId: string,
    @Req() request: Request
  ): Promise<Regulation_PLResponseDto[]> {
    const entities = await this.service.findByRegulatoryBody(
      regulatoryBodyId,
      request.context
    )
    return entities.map((e) => Regulation_PLResponseDto.fromDomain(e))
  }

  @Get('by-regulation-type/:regulationTypeId')
  @Authorize(Action.Read, Regulation_PL)
  async findByRegulationType(
    @Param('regulationTypeId', ParseUUIDPipe) regulationTypeId: string,
    @Req() request: Request
  ): Promise<Regulation_PLResponseDto[]> {
    const entities = await this.service.findByRegulationType(
      regulationTypeId,
      request.context
    )
    return entities.map((e) => Regulation_PLResponseDto.fromDomain(e))
  }

  @Get(':id')
  @Authorize(Action.Read, Regulation_PL)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<Regulation_PLResponseDto> {
    const entity = await this.service.findById(id, request.context)
    return Regulation_PLResponseDto.fromDomain(entity)
  }

  @Patch(':id')
  @Authorize(Action.Manage, Regulation_PL)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRegulation_PLDto,
    @Req() request: Request
  ): Promise<Regulation_PLResponseDto> {
    const entity = await this.service.findById(id, request.context)
    if (dto.number) entity.changeNumber(dto.number)
    if (dto.year !== undefined) entity.changeYear(dto.year)
    if (dto.title !== undefined) entity.changeTitle(dto.title)
    if (dto.publishedAt !== undefined) entity.changePublishedAt(dto.publishedAt)
    if (dto.regulatoryBodyId)
      entity.changeRegulatoryBodyId(dto.regulatoryBodyId)
    if (dto.regulationTypeId)
      entity.changeRegulationTypeId(dto.regulationTypeId)
    const saved = await this.service.save(entity, request.context)
    return Regulation_PLResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Manage, Regulation_PL)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Manage, Regulation_PL)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<Regulation_PLResponseDto> {
    const entity = await this.service.activate(id, request.context)
    return Regulation_PLResponseDto.fromDomain(entity)
  }

  @Post(':id/lock')
  @Authorize(Action.Manage, Regulation_PL)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<Regulation_PLResponseDto> {
    const entity = await this.service.lock(id, request.context)
    return Regulation_PLResponseDto.fromDomain(entity)
  }

  @Post(':id/unlock')
  @Authorize(Action.Manage, Regulation_PL)
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<Regulation_PLResponseDto> {
    const entity = await this.service.unlock(id, request.context)
    return Regulation_PLResponseDto.fromDomain(entity)
  }
}
