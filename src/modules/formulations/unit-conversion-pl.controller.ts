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
  CreateUnitConversion_PLDto,
  CreateUnitConversion_PLResponseDto,
  UnitConversion_PLResponseDto,
  UpdateUnitConversion_PLDto
} from '@formulations/unit-conversion-pl.dto'
import { UnitConversion_PLService } from '@formulations/unit-conversion-pl.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { UnitConversion_PL } from '@formulations/unit-conversion-pl.entity'

@ApiTags('Unit Conversions PL')
@ApiBearerAuth('accessToken')
@Controller('unit-conversions-pl')
export class UnitConversion_PLController {
  constructor(private readonly service: UnitConversion_PLService) {}

  @Post()
  @Authorize(Action.Manage, UnitConversion_PL)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateUnitConversion_PLDto,
    @Req() request: Request
  ): Promise<CreateUnitConversion_PLResponseDto> {
    const entity = await this.service.create(
      {
        fromUnitId: dto.fromUnitId,
        toUnitId: dto.toUnitId,
        factor: dto.factor
      },
      request.context
    )
    return CreateUnitConversion_PLResponseDto.fromDomain(entity)
  }

  @Get()
  @Authorize(Action.Manage, UnitConversion_PL)
  async findAll(@Req() request: Request): Promise<UnitConversion_PLResponseDto[]> {
    const entities = await this.service.findAll(request.context)
    return entities.map((e) => UnitConversion_PLResponseDto.fromDomain(e))
  }

  @Get(':id')
  @Authorize(Action.Manage, UnitConversion_PL)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<UnitConversion_PLResponseDto> {
    const entity = await this.service.findById(id, request.context)
    return UnitConversion_PLResponseDto.fromDomain(entity)
  }

  @Get('by-from-unit/:fromUnitId')
  @Authorize(Action.Manage, UnitConversion_PL)
  async findByFromUnit(
    @Param('fromUnitId', ParseUUIDPipe) fromUnitId: string,
    @Req() request: Request
  ): Promise<UnitConversion_PLResponseDto[]> {
    const entities = await this.service.findByFromUnit(fromUnitId, request.context)
    return entities.map((e) => UnitConversion_PLResponseDto.fromDomain(e))
  }

  @Get('by-to-unit/:toUnitId')
  @Authorize(Action.Manage, UnitConversion_PL)
  async findByToUnit(
    @Param('toUnitId', ParseUUIDPipe) toUnitId: string,
    @Req() request: Request
  ): Promise<UnitConversion_PLResponseDto[]> {
    const entities = await this.service.findByToUnit(toUnitId, request.context)
    return entities.map((e) => UnitConversion_PLResponseDto.fromDomain(e))
  }

  @Patch(':id')
  @Authorize(Action.Manage, UnitConversion_PL)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUnitConversion_PLDto,
    @Req() request: Request
  ): Promise<UnitConversion_PLResponseDto> {
    const entity = await this.service.findById(id, request.context)

    if (dto.factor !== undefined) entity.changeFactor(dto.factor)

    const saved = await this.service.save(entity, request.context)
    return UnitConversion_PLResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Manage, UnitConversion_PL)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Manage, UnitConversion_PL)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<UnitConversion_PLResponseDto> {
    const entity = await this.service.activate(id, request.context)
    return UnitConversion_PLResponseDto.fromDomain(entity)
  }

  @Post(':id/lock')
  @Authorize(Action.Manage, UnitConversion_PL)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<UnitConversion_PLResponseDto> {
    const entity = await this.service.lock(id, request.context)
    return UnitConversion_PLResponseDto.fromDomain(entity)
  }

  @Post(':id/unlock')
  @Authorize(Action.Manage, UnitConversion_PL)
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<UnitConversion_PLResponseDto> {
    const entity = await this.service.unlock(id, request.context)
    return UnitConversion_PLResponseDto.fromDomain(entity)
  }
}
