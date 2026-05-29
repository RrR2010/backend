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
  CreateTenantAllergenDto,
  CreateTenantAllergenResponseDto,
  TenantAllergenResponseDto,
  UpdateTenantAllergenDto
} from '@ingredients/tenant-allergen.dto'
import { TenantAllergenService } from '@ingredients/tenant-allergen.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { TenantAllergen } from '@ingredients/tenant-allergen.entity'

@ApiTags('Tenant Allergens')
@ApiBearerAuth('accessToken')
@Controller('tenant-allergens')
export class TenantAllergensController {
  constructor(private readonly service: TenantAllergenService) {}

  @Post()
  @Authorize(Action.Create, TenantAllergen)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateTenantAllergenDto,
    @Req() request: Request
  ): Promise<CreateTenantAllergenResponseDto> {
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
    return CreateTenantAllergenResponseDto.fromDomain(allergen)
  }

  @Get()
  @Authorize(Action.Read, TenantAllergen)
  async findAll(@Req() request: Request): Promise<TenantAllergenResponseDto[]> {
    const allergens = await this.service.findAll({}, request.context)
    return allergens.map(TenantAllergenResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, TenantAllergen)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<TenantAllergenResponseDto> {
    const allergen = await this.service.findById(id, request.context)
    return TenantAllergenResponseDto.fromDomain(allergen)
  }

  @Patch(':id')
  @Authorize(Action.Update, TenantAllergen)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTenantAllergenDto,
    @Req() request: Request
  ): Promise<TenantAllergenResponseDto> {
    const allergen = await this.service.findById(id, request.context)

    if (dto.name) allergen.changeName(dto.name)
    if (dto.category !== undefined) allergen.changeCategory(dto.category)
    if (dto.regulatoryRef !== undefined)
      allergen.changeRegulatoryRef(dto.regulatoryRef)
    if (dto.sortOrder !== undefined) allergen.changeSortOrder(dto.sortOrder)
    if (dto.isActive !== undefined) {
      dto.isActive ? allergen.setActive() : allergen.setInactive()
    }

    const saved = await this.service.save(allergen, request.context)
    return TenantAllergenResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, TenantAllergen)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, TenantAllergen)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<TenantAllergenResponseDto> {
    const allergen = await this.service.activate(id, request.context)
    return TenantAllergenResponseDto.fromDomain(allergen)
  }

  @Post(':id/lock')
  @Authorize(Action.Update, TenantAllergen)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<TenantAllergenResponseDto> {
    const allergen = await this.service.lock(id, request.context)
    return TenantAllergenResponseDto.fromDomain(allergen)
  }

  @Post(':id/unlock')
  @Authorize(Action.Unlock, TenantAllergen)
  @ApiConsumes('application/json')
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<TenantAllergenResponseDto> {
    const allergen = await this.service.unlock(id, request.context)
    return TenantAllergenResponseDto.fromDomain(allergen)
  }
}
