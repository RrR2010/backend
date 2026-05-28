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
  CreateNutrientDto,
  CreateNutrientResponseDto,
  NutrientResponseDto,
  UpdateNutrientDto
} from '@ingredients/nutrient.dto'
import { NutrientService } from '@ingredients/nutrient.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { Nutrient } from '@ingredients/nutrient.entity'

@ApiTags('Nutrients')
@ApiBearerAuth('accessToken')
@Controller('nutrients')
export class NutrientsController {
  constructor(private readonly service: NutrientService) {}

  @Post()
  @Authorize(Action.Create, Nutrient)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateNutrientDto,
    @Req() request: Request
  ): Promise<CreateNutrientResponseDto> {
    const nutrient = await this.service.create(
      {
        tenantId: dto.tenantId,
        name: dto.name,
        unit: dto.unit,
        category: dto.category,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true
      },
      request.context
    )
    return CreateNutrientResponseDto.fromDomain(nutrient)
  }

  @Get()
  @Authorize(Action.Read, Nutrient)
  async findAll(@Req() request: Request): Promise<NutrientResponseDto[]> {
    const nutrients = await this.service.findAll({}, request.context)
    return nutrients.map(NutrientResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, Nutrient)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<NutrientResponseDto> {
    const nutrient = await this.service.findById(id, request.context)
    return NutrientResponseDto.fromDomain(nutrient)
  }

  @Patch(':id')
  @Authorize(Action.Update, Nutrient)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNutrientDto,
    @Req() request: Request
  ): Promise<NutrientResponseDto> {
    const nutrient = await this.service.findById(id, request.context)

    if (dto.name) nutrient.changeName(dto.name)
    if (dto.unit) nutrient.changeUnit(dto.unit)
    if (dto.category !== undefined) nutrient.changeCategory(dto.category)
    if (dto.sortOrder !== undefined) nutrient.changeSortOrder(dto.sortOrder)
    if (dto.isActive !== undefined) {
      dto.isActive ? nutrient.setActive() : nutrient.setInactive()
    }

    const saved = await this.service.save(nutrient, request.context)
    return NutrientResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, Nutrient)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, Nutrient)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<NutrientResponseDto> {
    const nutrient = await this.service.activate(id, request.context)
    return NutrientResponseDto.fromDomain(nutrient)
  }

  @Post(':id/lock')
  @Authorize(Action.Update, Nutrient)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<NutrientResponseDto> {
    const nutrient = await this.service.lock(id, request.context)
    return NutrientResponseDto.fromDomain(nutrient)
  }

  @Post(':id/unlock')
  @Authorize(Action.Unlock, Nutrient)
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<NutrientResponseDto> {
    const nutrient = await this.service.unlock(id, request.context)
    return NutrientResponseDto.fromDomain(nutrient)
  }
}
