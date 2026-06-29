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
  CreateTechnicalSourceType_TEDto,
  CreateTechnicalSourceType_TEDtoResponseDto,
  TechnicalSourceType_TEDtoResponseDto,
  UpdateTechnicalSourceType_TEDto
} from '@ingredients/technical-source-type-te.dto'
import { TechnicalSourceType_TEService } from '@ingredients/technical-source-type-te.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { TechnicalSourceType_TE } from '@ingredients/technical-source-type-te.entity'

@ApiTags('TechnicalSourceTypes')
@ApiBearerAuth('accessToken')
@Controller('technical-source-types')
export class TechnicalSourceType_TEController {
  constructor(private readonly service: TechnicalSourceType_TEService) {}

  @Post()
  @Authorize(Action.Create, TechnicalSourceType_TE)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateTechnicalSourceType_TEDto,
    @Req() request: Request
  ): Promise<CreateTechnicalSourceType_TEDtoResponseDto> {
    const source = await this.service.create(
      {
        tenantId: dto.tenantId,
        name: dto.name,
        description: dto.description ?? null
      },
      request.context
    )
    return CreateTechnicalSourceType_TEDtoResponseDto.fromDomain(source)
  }

  @Get()
  @Authorize(Action.Read, TechnicalSourceType_TE)
  async findAll(
    @Req() request: Request
  ): Promise<TechnicalSourceType_TEDtoResponseDto[]> {
    const sources = await this.service.findAll({}, request.context)
    return sources.map(TechnicalSourceType_TEDtoResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, TechnicalSourceType_TE)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<TechnicalSourceType_TEDtoResponseDto> {
    const source = await this.service.findById(id, request.context)
    return TechnicalSourceType_TEDtoResponseDto.fromDomain(source)
  }

  @Patch(':id')
  @Authorize(Action.Update, TechnicalSourceType_TE)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTechnicalSourceType_TEDto,
    @Req() request: Request
  ): Promise<TechnicalSourceType_TEDtoResponseDto> {
    const source = await this.service.findById(id, request.context)

    if (dto.name) source.changeName(dto.name)
    if (dto.description !== undefined) source.changeDescription(dto.description)

    const saved = await this.service.save(source, request.context)
    return TechnicalSourceType_TEDtoResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, TechnicalSourceType_TE)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, TechnicalSourceType_TE)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<TechnicalSourceType_TEDtoResponseDto> {
    const entity = await this.service.activate(id, request.context)
    return TechnicalSourceType_TEDtoResponseDto.fromDomain(entity)
  }

  @Post(':id/lock')
  @Authorize(Action.Update, TechnicalSourceType_TE)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<TechnicalSourceType_TEDtoResponseDto> {
    const entity = await this.service.lock(id, request.context)
    return TechnicalSourceType_TEDtoResponseDto.fromDomain(entity)
  }

  @Post(':id/unlock')
  @Authorize(Action.Unlock, TechnicalSourceType_TE)
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<TechnicalSourceType_TEDtoResponseDto> {
    const entity = await this.service.unlock(id, request.context)
    return TechnicalSourceType_TEDtoResponseDto.fromDomain(entity)
  }
}
