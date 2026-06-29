import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Patch,
  ParseUUIDPipe,
  Query,
  Req
} from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import {
  CreateTechnicalSourceType_PLDto,
  CreateTechnicalSourceType_PLResponseDto,
  TechnicalSourceType_PLResponseDto,
  UpdateTechnicalSourceType_PLDto
} from '@ingredients/technical-source-type-pl.dto'
import { TechnicalSourceType_PLService } from '@ingredients/technical-source-type-pl.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { TechnicalSourceType_PL } from '@ingredients/technical-source-type-pl.entity'

@ApiTags('Technical Source Types PL')
@ApiBearerAuth('accessToken')
@Controller('technical-source-types-pl')
export class TechnicalSourceType_PLController {
  constructor(private readonly service: TechnicalSourceType_PLService) {}

  @Post()
  @Authorize(Action.Manage, TechnicalSourceType_PL)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateTechnicalSourceType_PLDto,
    @Req() request: Request
  ): Promise<CreateTechnicalSourceType_PLResponseDto> {
    const type = await this.service.create(
      {
        code: dto.code,
        name: dto.name,
        description: dto.description ?? null
      },
      request.context
    )
    return CreateTechnicalSourceType_PLResponseDto.fromDomain(type)
  }

  @Get()
  @Authorize(Action.Manage, TechnicalSourceType_PL)
  async findAll(
    @Req() request: Request,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ): Promise<TechnicalSourceType_PLResponseDto[]> {
    const types = await this.service.findAll(
      { skip: Number(offset) || 0, take: Number(limit) || 50 },
      request.context
    )
    return types.map((t) => TechnicalSourceType_PLResponseDto.fromDomain(t))
  }

  @Get(':id')
  @Authorize(Action.Manage, TechnicalSourceType_PL)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<TechnicalSourceType_PLResponseDto> {
    const type = await this.service.findById(id, request.context)
    return TechnicalSourceType_PLResponseDto.fromDomain(type)
  }

  @Patch(':id')
  @Authorize(Action.Manage, TechnicalSourceType_PL)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTechnicalSourceType_PLDto,
    @Req() request: Request
  ): Promise<TechnicalSourceType_PLResponseDto> {
    const type = await this.service.findById(id, request.context)

    if (dto.code) type.changeCode(dto.code)
    if (dto.name) type.changeName(dto.name)
    if (dto.description !== undefined)
      type.changeDescription(dto.description)

    const saved = await this.service.save(type, request.context)
    return TechnicalSourceType_PLResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Manage, TechnicalSourceType_PL)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Manage, TechnicalSourceType_PL)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<TechnicalSourceType_PLResponseDto> {
    const type = await this.service.activate(id, request.context)
    return TechnicalSourceType_PLResponseDto.fromDomain(type)
  }

  @Post(':id/lock')
  @Authorize(Action.Manage, TechnicalSourceType_PL)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<TechnicalSourceType_PLResponseDto> {
    const type = await this.service.lock(id, request.context)
    return TechnicalSourceType_PLResponseDto.fromDomain(type)
  }

  @Post(':id/unlock')
  @Authorize(Action.Manage, TechnicalSourceType_PL)
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<TechnicalSourceType_PLResponseDto> {
    const type = await this.service.unlock(id, request.context)
    return TechnicalSourceType_PLResponseDto.fromDomain(type)
  }
}
