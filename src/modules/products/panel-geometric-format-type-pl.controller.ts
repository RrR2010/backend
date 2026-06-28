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
  CreatePanelGeometricFormatType_PLDto,
  CreatePanelGeometricFormatType_PLResponseDto,
  PanelGeometricFormatType_PLResponseDto,
  UpdatePanelGeometricFormatType_PLDto
} from '@products/panel-geometric-format-type-pl.dto'
import { PanelGeometricFormatType_PLService } from '@products/panel-geometric-format-type-pl.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { PanelGeometricFormatType_PL } from '@products/panel-geometric-format-type-pl.entity'

@ApiTags('Panel Geometric Format Types PL')
@ApiBearerAuth('accessToken')
@Controller('panel-geometric-format-types-pl')
export class PanelGeometricFormatType_PLController {
  constructor(
    private readonly service: PanelGeometricFormatType_PLService
  ) {}

  @Post()
  @Authorize(Action.Manage, PanelGeometricFormatType_PL)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreatePanelGeometricFormatType_PLDto,
    @Req() request: Request
  ): Promise<CreatePanelGeometricFormatType_PLResponseDto> {
    const format = await this.service.create(
      {
        formatName: dto.formatName,
        valueFields: dto.valueFields ?? null,
        calculationFormula: dto.calculationFormula ?? null
      },
      request.context
    )
    return CreatePanelGeometricFormatType_PLResponseDto.fromDomain(format)
  }

  @Get()
  @Authorize(Action.Manage, PanelGeometricFormatType_PL)
  async findAll(
    @Req() request: Request
  ): Promise<PanelGeometricFormatType_PLResponseDto[]> {
    const formats = await this.service.findAll(request.context)
    return formats.map((f) =>
      PanelGeometricFormatType_PLResponseDto.fromDomain(f)
    )
  }

  @Get(':id')
  @Authorize(Action.Manage, PanelGeometricFormatType_PL)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<PanelGeometricFormatType_PLResponseDto> {
    const format = await this.service.findById(id, request.context)
    return PanelGeometricFormatType_PLResponseDto.fromDomain(format)
  }

  @Patch(':id')
  @Authorize(Action.Manage, PanelGeometricFormatType_PL)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePanelGeometricFormatType_PLDto,
    @Req() request: Request
  ): Promise<PanelGeometricFormatType_PLResponseDto> {
    const format = await this.service.findById(id, request.context)

    if (dto.formatName) format.changeFormatName(dto.formatName)
    if (dto.valueFields !== undefined)
      format.changeValueFields(dto.valueFields)
    if (dto.calculationFormula !== undefined)
      format.changeCalculationFormula(dto.calculationFormula)

    const saved = await this.service.save(format, request.context)
    return PanelGeometricFormatType_PLResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Manage, PanelGeometricFormatType_PL)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Manage, PanelGeometricFormatType_PL)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<PanelGeometricFormatType_PLResponseDto> {
    const format = await this.service.activate(id, request.context)
    return PanelGeometricFormatType_PLResponseDto.fromDomain(format)
  }

  @Post(':id/lock')
  @Authorize(Action.Manage, PanelGeometricFormatType_PL)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<PanelGeometricFormatType_PLResponseDto> {
    const format = await this.service.lock(id, request.context)
    return PanelGeometricFormatType_PLResponseDto.fromDomain(format)
  }

  @Post(':id/unlock')
  @Authorize(Action.Manage, PanelGeometricFormatType_PL)
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<PanelGeometricFormatType_PLResponseDto> {
    const format = await this.service.unlock(id, request.context)
    return PanelGeometricFormatType_PLResponseDto.fromDomain(format)
  }
}
