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
  CreateBaseNutrientDto,
  CreateBaseNutrientResponseDto,
  BaseNutrientResponseDto,
  UpdateBaseNutrientDto
} from '@ingredients/base-nutrient.dto'
import { BaseNutrientService } from '@ingredients/base-nutrient.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { BaseNutrient } from '@ingredients/base-nutrient.entity'

@ApiTags('Base Nutrients')
@ApiBearerAuth('accessToken')
@Controller('base-nutrients')
export class BaseNutrientController {
  constructor(private readonly service: BaseNutrientService) {}

  @Post()
  @Authorize(Action.Manage, BaseNutrient)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateBaseNutrientDto,
    @Req() request: Request
  ): Promise<CreateBaseNutrientResponseDto> {
    const nutrient = await this.service.create(
      {
        name: dto.name,
        unit: dto.unit,
        category: dto.category,
        subcategory: dto.subcategory ?? null,
        sortOrder: dto.sortOrder ?? 0
      },
      request.context
    )
    return CreateBaseNutrientResponseDto.fromDomain(nutrient)
  }

  @Get()
  @Authorize(Action.Manage, BaseNutrient)
  async findAll(@Req() request: Request): Promise<BaseNutrientResponseDto[]> {
    const nutrients = await this.service.findAll(request.context)
    return nutrients.map((n) => BaseNutrientResponseDto.fromDomain(n))
  }

  @Get(':id')
  @Authorize(Action.Manage, BaseNutrient)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<BaseNutrientResponseDto> {
    const nutrient = await this.service.findById(id, request.context)
    return BaseNutrientResponseDto.fromDomain(nutrient)
  }

  @Patch(':id')
  @Authorize(Action.Manage, BaseNutrient)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBaseNutrientDto,
    @Req() request: Request
  ): Promise<BaseNutrientResponseDto> {
    const nutrient = await this.service.findById(id, request.context)

    if (dto.name) nutrient.changeName(dto.name)
    if (dto.unit) nutrient.changeUnit(dto.unit)
    if (dto.category) nutrient.changeCategory(dto.category)
    if (dto.subcategory !== undefined)
      nutrient.changeSubcategory(dto.subcategory)
    if (dto.sortOrder !== undefined) nutrient.changeSortOrder(dto.sortOrder)

    const saved = await this.service.save(nutrient, request.context)
    return BaseNutrientResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Manage, BaseNutrient)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Manage, BaseNutrient)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<BaseNutrientResponseDto> {
    const nutrient = await this.service.activate(id, request.context)
    return BaseNutrientResponseDto.fromDomain(nutrient)
  }

  @Post(':id/lock')
  @Authorize(Action.Manage, BaseNutrient)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<BaseNutrientResponseDto> {
    const nutrient = await this.service.lock(id, request.context)
    return BaseNutrientResponseDto.fromDomain(nutrient)
  }

  @Post(':id/unlock')
  @Authorize(Action.Manage, BaseNutrient)
  @ApiConsumes('application/json')
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<BaseNutrientResponseDto> {
    const nutrient = await this.service.unlock(id, request.context)
    return BaseNutrientResponseDto.fromDomain(nutrient)
  }
}
