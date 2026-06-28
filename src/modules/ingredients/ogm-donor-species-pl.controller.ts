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
  CreateOgmDonorSpecies_PLDto,
  CreateOgmDonorSpecies_PLResponseDto,
  OgmDonorSpecies_PLResponseDto,
  UpdateOgmDonorSpecies_PLDto
} from '@ingredients/ogm-donor-species-pl.dto'
import { OgmDonorSpecies_PLService } from '@ingredients/ogm-donor-species-pl.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { OgmDonorSpecies_PL } from '@ingredients/ogm-donor-species-pl.entity'

@ApiTags('OGM Donor Species PL')
@ApiBearerAuth('accessToken')
@Controller('ogm-donor-species-pl')
export class OgmDonorSpecies_PLController {
  constructor(private readonly service: OgmDonorSpecies_PLService) {}

  @Post()
  @Authorize(Action.Manage, OgmDonorSpecies_PL)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateOgmDonorSpecies_PLDto,
    @Req() request: Request
  ): Promise<CreateOgmDonorSpecies_PLResponseDto> {
    const species = await this.service.create(
      {
        scientificName: dto.scientificName,
        commonName: dto.commonName ?? null,
        category: dto.category ?? null
      },
      request.context
    )
    return CreateOgmDonorSpecies_PLResponseDto.fromDomain(species)
  }

  @Get()
  @Authorize(Action.Manage, OgmDonorSpecies_PL)
  async findAll(
    @Req() request: Request
  ): Promise<OgmDonorSpecies_PLResponseDto[]> {
    const speciesList = await this.service.findAll(request.context)
    return speciesList.map((s) => OgmDonorSpecies_PLResponseDto.fromDomain(s))
  }

  @Get(':id')
  @Authorize(Action.Manage, OgmDonorSpecies_PL)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<OgmDonorSpecies_PLResponseDto> {
    const species = await this.service.findById(id, request.context)
    return OgmDonorSpecies_PLResponseDto.fromDomain(species)
  }

  @Patch(':id')
  @Authorize(Action.Manage, OgmDonorSpecies_PL)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOgmDonorSpecies_PLDto,
    @Req() request: Request
  ): Promise<OgmDonorSpecies_PLResponseDto> {
    const species = await this.service.findById(id, request.context)

    if (dto.scientificName) species.changeScientificName(dto.scientificName)
    if (dto.commonName !== undefined) species.changeCommonName(dto.commonName)
    if (dto.category !== undefined) species.changeCategory(dto.category)

    const saved = await this.service.save(species, request.context)
    return OgmDonorSpecies_PLResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Manage, OgmDonorSpecies_PL)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Manage, OgmDonorSpecies_PL)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<OgmDonorSpecies_PLResponseDto> {
    const species = await this.service.activate(id, request.context)
    return OgmDonorSpecies_PLResponseDto.fromDomain(species)
  }

  @Post(':id/lock')
  @Authorize(Action.Manage, OgmDonorSpecies_PL)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<OgmDonorSpecies_PLResponseDto> {
    const species = await this.service.lock(id, request.context)
    return OgmDonorSpecies_PLResponseDto.fromDomain(species)
  }

  @Post(':id/unlock')
  @Authorize(Action.Manage, OgmDonorSpecies_PL)
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<OgmDonorSpecies_PLResponseDto> {
    const species = await this.service.unlock(id, request.context)
    return OgmDonorSpecies_PLResponseDto.fromDomain(species)
  }
}
