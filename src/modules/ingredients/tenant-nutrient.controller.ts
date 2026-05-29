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
  CreateTenantNutrientDto,
  CreateTenantNutrientResponseDto,
  TenantNutrientResponseDto,
  UpdateTenantNutrientDto
} from '@ingredients/tenant-nutrient.dto'
import { TenantNutrientService } from '@ingredients/tenant-nutrient.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { TenantNutrient } from '@ingredients/tenant-nutrient.entity'

@ApiTags('Tenant Nutrients')
@ApiBearerAuth('accessToken')
@Controller('tenant-nutrients')
export class TenantNutrientsController {
  constructor(private readonly service: TenantNutrientService) {}

  @Post()
  @Authorize(Action.Create, TenantNutrient)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateTenantNutrientDto,
    @Req() request: Request
  ): Promise<CreateTenantNutrientResponseDto> {
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
    return CreateTenantNutrientResponseDto.fromDomain(nutrient)
  }

  @Get()
  @Authorize(Action.Read, TenantNutrient)
  async findAll(@Req() request: Request): Promise<TenantNutrientResponseDto[]> {
    const nutrients = await this.service.findAll({}, request.context)
    return nutrients.map(TenantNutrientResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, TenantNutrient)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<TenantNutrientResponseDto> {
    const nutrient = await this.service.findById(id, request.context)
    return TenantNutrientResponseDto.fromDomain(nutrient)
  }

  @Patch(':id')
  @Authorize(Action.Update, TenantNutrient)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTenantNutrientDto,
    @Req() request: Request
  ): Promise<TenantNutrientResponseDto> {
    const nutrient = await this.service.findById(id, request.context)

    if (dto.name) nutrient.changeName(dto.name)
    if (dto.unit) nutrient.changeUnit(dto.unit)
    if (dto.category !== undefined) nutrient.changeCategory(dto.category)
    if (dto.sortOrder !== undefined) nutrient.changeSortOrder(dto.sortOrder)
    if (dto.isActive !== undefined) {
      dto.isActive ? nutrient.setActive() : nutrient.setInactive()
    }

    const saved = await this.service.save(nutrient, request.context)
    return TenantNutrientResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, TenantNutrient)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, TenantNutrient)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<TenantNutrientResponseDto> {
    const nutrient = await this.service.activate(id, request.context)
    return TenantNutrientResponseDto.fromDomain(nutrient)
  }

  @Post(':id/lock')
  @Authorize(Action.Update, TenantNutrient)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<TenantNutrientResponseDto> {
    const nutrient = await this.service.lock(id, request.context)
    return TenantNutrientResponseDto.fromDomain(nutrient)
  }

  @Post(':id/unlock')
  @Authorize(Action.Unlock, TenantNutrient)
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<TenantNutrientResponseDto> {
    const nutrient = await this.service.unlock(id, request.context)
    return TenantNutrientResponseDto.fromDomain(nutrient)
  }
}
