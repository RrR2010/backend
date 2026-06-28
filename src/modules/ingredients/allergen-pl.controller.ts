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
  CreateAllergen_PLDto,
  CreateAllergen_PLResponseDto,
  Allergen_PLResponseDto,
  UpdateAllergen_PLDto
} from '@ingredients/allergen-pl.dto'
import { Allergen_PLService } from '@ingredients/allergen-pl.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { Allergen_PL } from '@ingredients/allergen-pl.entity'

@ApiTags('Allergens PL')
@ApiBearerAuth('accessToken')
@Controller('allergens-pl')
export class Allergen_PLController {
  constructor(private readonly service: Allergen_PLService) {}

  @Post()
  @Authorize(Action.Manage, Allergen_PL)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateAllergen_PLDto,
    @Req() request: Request
  ): Promise<CreateAllergen_PLResponseDto> {
    const allergen = await this.service.create(
      {
        name: dto.name,
        category: dto.category ?? null,
        regulatoryRef: dto.regulatoryRef ?? null,
        sortOrder: dto.sortOrder ?? 0
      },
      request.context
    )
    return CreateAllergen_PLResponseDto.fromDomain(allergen)
  }

  @Get()
  @Authorize(Action.Manage, Allergen_PL)
  async findAll(@Req() request: Request): Promise<Allergen_PLResponseDto[]> {
    const allergens = await this.service.findAll(request.context)
    return allergens.map((a) => Allergen_PLResponseDto.fromDomain(a))
  }

  @Get(':id')
  @Authorize(Action.Manage, Allergen_PL)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<Allergen_PLResponseDto> {
    const allergen = await this.service.findById(id, request.context)
    return Allergen_PLResponseDto.fromDomain(allergen)
  }

  @Patch(':id')
  @Authorize(Action.Manage, Allergen_PL)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAllergen_PLDto,
    @Req() request: Request
  ): Promise<Allergen_PLResponseDto> {
    const allergen = await this.service.findById(id, request.context)

    if (dto.name) allergen.changeName(dto.name)
    if (dto.category !== undefined) allergen.changeCategory(dto.category)
    if (dto.regulatoryRef !== undefined)
      allergen.changeRegulatoryRef(dto.regulatoryRef)
    if (dto.sortOrder !== undefined) allergen.changeSortOrder(dto.sortOrder)

    const saved = await this.service.save(allergen, request.context)
    return Allergen_PLResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Manage, Allergen_PL)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Manage, Allergen_PL)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<Allergen_PLResponseDto> {
    const allergen = await this.service.activate(id, request.context)
    return Allergen_PLResponseDto.fromDomain(allergen)
  }

  @Post(':id/lock')
  @Authorize(Action.Manage, Allergen_PL)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<Allergen_PLResponseDto> {
    const allergen = await this.service.lock(id, request.context)
    return Allergen_PLResponseDto.fromDomain(allergen)
  }

  @Post(':id/unlock')
  @Authorize(Action.Manage, Allergen_PL)
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<Allergen_PLResponseDto> {
    const allergen = await this.service.unlock(id, request.context)
    return Allergen_PLResponseDto.fromDomain(allergen)
  }
}
