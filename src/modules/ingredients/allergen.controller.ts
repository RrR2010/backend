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
  CreateAllergenDto,
  CreateAllergenResponseDto,
  AllergenResponseDto,
  UpdateAllergenDto
} from '@ingredients/allergen.dto'
import { AllergenService } from '@ingredients/allergen.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { Allergen } from '@ingredients/allergen.entity'

@ApiTags('Allergens')
@ApiBearerAuth('accessToken')
@Controller('allergens')
export class AllergensController {
  constructor(private readonly service: AllergenService) {}

  @Post()
  @Authorize(Action.Create, Allergen)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateAllergenDto,
    @Req() request: Request
  ): Promise<CreateAllergenResponseDto> {
    const allergen = await this.service.create(
      {
        tenantId: dto.tenantId,
        name: dto.name,
        category: dto.category ?? null,
        regulatoryRef: dto.regulatoryRef ?? null,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true
      },
      request.context
    )
    return CreateAllergenResponseDto.fromDomain(allergen)
  }

  @Get()
  @Authorize(Action.Read, Allergen)
  async findAll(@Req() request: Request): Promise<AllergenResponseDto[]> {
    const allergens = await this.service.findAll({}, request.context)
    return allergens.map(AllergenResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, Allergen)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<AllergenResponseDto> {
    const allergen = await this.service.findById(id, request.context)
    return AllergenResponseDto.fromDomain(allergen)
  }

  @Patch(':id')
  @Authorize(Action.Update, Allergen)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAllergenDto,
    @Req() request: Request
  ): Promise<AllergenResponseDto> {
    const allergen = await this.service.findById(id, request.context)

    if (dto.name) allergen.changeName(dto.name)
    if (dto.category !== undefined) allergen.changeCategory(dto.category)
    if (dto.regulatoryRef !== undefined) allergen.changeRegulatoryRef(dto.regulatoryRef)
    if (dto.sortOrder !== undefined) allergen.changeSortOrder(dto.sortOrder)
    if (dto.isActive !== undefined) {
      dto.isActive ? allergen.setActive() : allergen.setInactive()
    }

    const saved = await this.service.save(allergen, request.context)
    return AllergenResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, Allergen)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, Allergen)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<AllergenResponseDto> {
    const allergen = await this.service.activate(id, request.context)
    return AllergenResponseDto.fromDomain(allergen)
  }

  @Post(':id/lock')
  @Authorize(Action.Update, Allergen)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<AllergenResponseDto> {
    const allergen = await this.service.lock(id, request.context)
    return AllergenResponseDto.fromDomain(allergen)
  }
}
