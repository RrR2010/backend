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
  CreateUnitOfMeasure_PLDto,
  CreateUnitOfMeasure_PLResponseDto,
  UnitOfMeasure_PLResponseDto,
  UpdateUnitOfMeasure_PLDto
} from '@formulations/unit-of-measure-pl.dto'
import { UnitOfMeasure_PLService } from '@formulations/unit-of-measure-pl.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { UnitOfMeasure_PL } from '@formulations/unit-of-measure-pl.entity'

@ApiTags('Units of Measure PL')
@ApiBearerAuth('accessToken')
@Controller('units-of-measure-pl')
export class UnitOfMeasure_PLController {
  constructor(private readonly service: UnitOfMeasure_PLService) {}

  @Post()
  @Authorize(Action.Manage, UnitOfMeasure_PL)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateUnitOfMeasure_PLDto,
    @Req() request: Request
  ): Promise<CreateUnitOfMeasure_PLResponseDto> {
    const entity = await this.service.create(
      {
        code: dto.code,
        symbol: dto.symbol ?? null,
        measurementType: dto.measurementType,
        measurementSystem: dto.measurementSystem
      },
      request.context
    )
    return CreateUnitOfMeasure_PLResponseDto.fromDomain(entity)
  }

  @Get()
  @Authorize(Action.Manage, UnitOfMeasure_PL)
  async findAll(
    @Req() request: Request,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ): Promise<UnitOfMeasure_PLResponseDto[]> {
    const entities = await this.service.findAll(
      { skip: Number(offset) || 0, take: Number(limit) || 50 },
      request.context
    )
    return entities.map((e) => UnitOfMeasure_PLResponseDto.fromDomain(e))
  }

  @Get(':id')
  @Authorize(Action.Manage, UnitOfMeasure_PL)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<UnitOfMeasure_PLResponseDto> {
    const entity = await this.service.findById(id, request.context)
    return UnitOfMeasure_PLResponseDto.fromDomain(entity)
  }

  @Patch(':id')
  @Authorize(Action.Manage, UnitOfMeasure_PL)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUnitOfMeasure_PLDto,
    @Req() request: Request
  ): Promise<UnitOfMeasure_PLResponseDto> {
    const entity = await this.service.findById(id, request.context)

    if (dto.code) entity.changeCode(dto.code)
    if (dto.symbol !== undefined) entity.changeSymbol(dto.symbol)
    if (dto.measurementType) entity.changeMeasurementType(dto.measurementType)
    if (dto.measurementSystem) entity.changeMeasurementSystem(dto.measurementSystem)

    const saved = await this.service.save(entity, request.context)
    return UnitOfMeasure_PLResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Manage, UnitOfMeasure_PL)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Manage, UnitOfMeasure_PL)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<UnitOfMeasure_PLResponseDto> {
    const entity = await this.service.activate(id, request.context)
    return UnitOfMeasure_PLResponseDto.fromDomain(entity)
  }

  @Post(':id/lock')
  @Authorize(Action.Manage, UnitOfMeasure_PL)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<UnitOfMeasure_PLResponseDto> {
    const entity = await this.service.lock(id, request.context)
    return UnitOfMeasure_PLResponseDto.fromDomain(entity)
  }

  @Post(':id/unlock')
  @Authorize(Action.Manage, UnitOfMeasure_PL)
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<UnitOfMeasure_PLResponseDto> {
    const entity = await this.service.unlock(id, request.context)
    return UnitOfMeasure_PLResponseDto.fromDomain(entity)
  }
}
