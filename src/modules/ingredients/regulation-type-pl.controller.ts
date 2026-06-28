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
  CreateRegulationType_PLDto,
  CreateRegulationType_PLResponseDto,
  RegulationType_PLResponseDto,
  UpdateRegulationType_PLDto
} from '@ingredients/regulation-type-pl.dto'
import { RegulationType_PLService } from '@ingredients/regulation-type-pl.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { RegulationType_PL } from '@ingredients/regulation-type-pl.entity'

@ApiTags('Regulation Types PL')
@ApiBearerAuth('accessToken')
@Controller('regulation-types-pl')
export class RegulationType_PLController {
  constructor(private readonly service: RegulationType_PLService) {}

  @Post()
  @Authorize(Action.Manage, RegulationType_PL)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateRegulationType_PLDto,
    @Req() request: Request
  ): Promise<CreateRegulationType_PLResponseDto> {
    const entity = await this.service.create(
      {
        abbreviation: dto.abbreviation,
        code: dto.code,
        name: dto.name,
        description: dto.description ?? null
      },
      request.context
    )
    return CreateRegulationType_PLResponseDto.fromDomain(entity)
  }

  @Get()
  @Authorize(Action.Read, RegulationType_PL)
  async findAll(
    @Req() request: Request
  ): Promise<RegulationType_PLResponseDto[]> {
    const entities = await this.service.findAll(request.context)
    return entities.map((e) => RegulationType_PLResponseDto.fromDomain(e))
  }

  @Get(':id')
  @Authorize(Action.Read, RegulationType_PL)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<RegulationType_PLResponseDto> {
    const entity = await this.service.findById(id, request.context)
    return RegulationType_PLResponseDto.fromDomain(entity)
  }

  @Patch(':id')
  @Authorize(Action.Manage, RegulationType_PL)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRegulationType_PLDto,
    @Req() request: Request
  ): Promise<RegulationType_PLResponseDto> {
    const entity = await this.service.findById(id, request.context)
    if (dto.abbreviation) entity.changeAbbreviation(dto.abbreviation)
    if (dto.code) entity.changeCode(dto.code)
    if (dto.name) entity.changeName(dto.name)
    if (dto.description !== undefined) entity.changeDescription(dto.description)
    const saved = await this.service.save(entity, request.context)
    return RegulationType_PLResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Manage, RegulationType_PL)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Manage, RegulationType_PL)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<RegulationType_PLResponseDto> {
    const entity = await this.service.activate(id, request.context)
    return RegulationType_PLResponseDto.fromDomain(entity)
  }

  @Post(':id/lock')
  @Authorize(Action.Manage, RegulationType_PL)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<RegulationType_PLResponseDto> {
    const entity = await this.service.lock(id, request.context)
    return RegulationType_PLResponseDto.fromDomain(entity)
  }

  @Post(':id/unlock')
  @Authorize(Action.Manage, RegulationType_PL)
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<RegulationType_PLResponseDto> {
    const entity = await this.service.unlock(id, request.context)
    return RegulationType_PLResponseDto.fromDomain(entity)
  }
}
