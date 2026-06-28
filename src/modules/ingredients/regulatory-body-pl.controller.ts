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
  CreateRegulatoryBody_PLDto,
  CreateRegulatoryBody_PLResponseDto,
  RegulatoryBody_PLResponseDto,
  UpdateRegulatoryBody_PLDto
} from '@ingredients/regulatory-body-pl.dto'
import { RegulatoryBody_PLService } from '@ingredients/regulatory-body-pl.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { RegulatoryBody_PL } from '@ingredients/regulatory-body-pl.entity'

@ApiTags('Regulatory Bodies PL')
@ApiBearerAuth('accessToken')
@Controller('regulatory-bodies-pl')
export class RegulatoryBody_PLController {
  constructor(private readonly service: RegulatoryBody_PLService) {}

  @Post()
  @Authorize(Action.Manage, RegulatoryBody_PL)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateRegulatoryBody_PLDto,
    @Req() request: Request
  ): Promise<CreateRegulatoryBody_PLResponseDto> {
    const entity = await this.service.create(
      {
        abbreviation: dto.abbreviation ?? null,
        code: dto.code,
        name: dto.name,
        description: dto.description ?? null
      },
      request.context
    )
    return CreateRegulatoryBody_PLResponseDto.fromDomain(entity)
  }

  @Get()
  @Authorize(Action.Read, RegulatoryBody_PL)
  async findAll(
    @Req() request: Request
  ): Promise<RegulatoryBody_PLResponseDto[]> {
    const entities = await this.service.findAll(request.context)
    return entities.map((e) => RegulatoryBody_PLResponseDto.fromDomain(e))
  }

  @Get(':id')
  @Authorize(Action.Read, RegulatoryBody_PL)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<RegulatoryBody_PLResponseDto> {
    const entity = await this.service.findById(id, request.context)
    return RegulatoryBody_PLResponseDto.fromDomain(entity)
  }

  @Patch(':id')
  @Authorize(Action.Manage, RegulatoryBody_PL)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRegulatoryBody_PLDto,
    @Req() request: Request
  ): Promise<RegulatoryBody_PLResponseDto> {
    const entity = await this.service.findById(id, request.context)
    if (dto.abbreviation !== undefined)
      entity.changeAbbreviation(dto.abbreviation)
    if (dto.code) entity.changeCode(dto.code)
    if (dto.name) entity.changeName(dto.name)
    if (dto.description !== undefined) entity.changeDescription(dto.description)
    const saved = await this.service.save(entity, request.context)
    return RegulatoryBody_PLResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Manage, RegulatoryBody_PL)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Manage, RegulatoryBody_PL)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<RegulatoryBody_PLResponseDto> {
    const entity = await this.service.activate(id, request.context)
    return RegulatoryBody_PLResponseDto.fromDomain(entity)
  }

  @Post(':id/lock')
  @Authorize(Action.Manage, RegulatoryBody_PL)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<RegulatoryBody_PLResponseDto> {
    const entity = await this.service.lock(id, request.context)
    return RegulatoryBody_PLResponseDto.fromDomain(entity)
  }

  @Post(':id/unlock')
  @Authorize(Action.Manage, RegulatoryBody_PL)
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<RegulatoryBody_PLResponseDto> {
    const entity = await this.service.unlock(id, request.context)
    return RegulatoryBody_PLResponseDto.fromDomain(entity)
  }
}
