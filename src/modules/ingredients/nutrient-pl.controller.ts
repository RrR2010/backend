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
  CreateNutrient_PLDto,
  CreateNutrient_PLResponseDto,
  Nutrient_PLResponseDto,
  UpdateNutrient_PLDto
} from '@ingredients/nutrient-pl.dto'
import { Nutrient_PLService } from '@ingredients/nutrient-pl.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { Nutrient_PL } from '@ingredients/nutrient-pl.entity'

@ApiTags('Nutrients PL')
@ApiBearerAuth('accessToken')
@Controller('nutrients-pl')
export class Nutrient_PLController {
  constructor(private readonly service: Nutrient_PLService) {}

  @Post()
  @Authorize(Action.Manage, Nutrient_PL)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateNutrient_PLDto,
    @Req() request: Request
  ): Promise<CreateNutrient_PLResponseDto> {
    const nutrient = await this.service.create(
      {
        name: dto.name,
        unit: dto.unit,
        category: dto.category,
        parentId: dto.parentId ?? null,
        level: dto.level ?? 0,
        sortOrder: dto.sortOrder ?? 0,
        regulatoryRef: dto.regulatoryRef ?? null
      },
      request.context
    )
    return CreateNutrient_PLResponseDto.fromDomain(nutrient)
  }

  @Get()
  @Authorize(Action.Manage, Nutrient_PL)
  async findAll(@Req() request: Request): Promise<Nutrient_PLResponseDto[]> {
    const nutrients = await this.service.findAll(request.context)
    return nutrients.map((n) => Nutrient_PLResponseDto.fromDomain(n))
  }

  @Get(':id')
  @Authorize(Action.Manage, Nutrient_PL)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<Nutrient_PLResponseDto> {
    const nutrient = await this.service.findById(id, request.context)
    return Nutrient_PLResponseDto.fromDomain(nutrient)
  }

  @Patch(':id')
  @Authorize(Action.Manage, Nutrient_PL)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNutrient_PLDto,
    @Req() request: Request
  ): Promise<Nutrient_PLResponseDto> {
    const nutrient = await this.service.findById(id, request.context)

    if (dto.name) nutrient.changeName(dto.name)
    if (dto.unit) nutrient.changeUnit(dto.unit)
    if (dto.category) nutrient.changeCategory(dto.category)
    if (dto.parentId !== undefined) nutrient.changeParentId(dto.parentId)
    if (dto.level !== undefined) nutrient.changeLevel(dto.level)
    if (dto.sortOrder !== undefined) nutrient.changeSortOrder(dto.sortOrder)
    if (dto.regulatoryRef !== undefined)
      nutrient.changeRegulatoryRef(dto.regulatoryRef)

    const saved = await this.service.save(nutrient, request.context)
    return Nutrient_PLResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Manage, Nutrient_PL)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Manage, Nutrient_PL)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<Nutrient_PLResponseDto> {
    const nutrient = await this.service.activate(id, request.context)
    return Nutrient_PLResponseDto.fromDomain(nutrient)
  }

  @Post(':id/lock')
  @Authorize(Action.Manage, Nutrient_PL)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<Nutrient_PLResponseDto> {
    const nutrient = await this.service.lock(id, request.context)
    return Nutrient_PLResponseDto.fromDomain(nutrient)
  }

  @Post(':id/unlock')
  @Authorize(Action.Manage, Nutrient_PL)
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<Nutrient_PLResponseDto> {
    const nutrient = await this.service.unlock(id, request.context)
    return Nutrient_PLResponseDto.fromDomain(nutrient)
  }
}
