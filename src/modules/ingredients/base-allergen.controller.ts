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
  CreateBaseAllergenDto,
  CreateBaseAllergenResponseDto,
  BaseAllergenResponseDto,
  UpdateBaseAllergenDto
} from '@ingredients/base-allergen.dto'
import { BaseAllergenService } from '@ingredients/base-allergen.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'

// TODO: Register BaseAllergen in CASL Subjects and replace 'all' with BaseAllergen class
@ApiTags('Base Allergens')
@ApiBearerAuth('accessToken')
@Controller('base-allergens')
export class BaseAllergenController {
  constructor(private readonly service: BaseAllergenService) {}

  @Post()
  @Authorize(Action.Manage, 'all')
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateBaseAllergenDto,
    @Req() request: Request
  ): Promise<CreateBaseAllergenResponseDto> {
    const allergen = await this.service.create(
      {
        name: dto.name,
        category: dto.category ?? null,
        regulatoryRef: dto.regulatoryRef ?? null,
        sortOrder: dto.sortOrder ?? 0
      },
      request.context
    )
    return CreateBaseAllergenResponseDto.fromDomain(allergen)
  }

  @Get()
  @Authorize(Action.Manage, 'all')
  async findAll(@Req() request: Request): Promise<BaseAllergenResponseDto[]> {
    const allergens = await this.service.findAll(request.context)
    return allergens.map(BaseAllergenResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Manage, 'all')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<BaseAllergenResponseDto> {
    const allergen = await this.service.findById(id, request.context)
    return BaseAllergenResponseDto.fromDomain(allergen)
  }

  @Patch(':id')
  @Authorize(Action.Manage, 'all')
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBaseAllergenDto,
    @Req() request: Request
  ): Promise<BaseAllergenResponseDto> {
    const allergen = await this.service.findById(id, request.context)

    if (dto.name) allergen.changeName(dto.name)
    if (dto.category !== undefined) allergen.changeCategory(dto.category)
    if (dto.regulatoryRef !== undefined) allergen.changeRegulatoryRef(dto.regulatoryRef)
    if (dto.sortOrder !== undefined) allergen.changeSortOrder(dto.sortOrder)

    const saved = await this.service.save(allergen, request.context)
    return BaseAllergenResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Manage, 'all')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }
}
