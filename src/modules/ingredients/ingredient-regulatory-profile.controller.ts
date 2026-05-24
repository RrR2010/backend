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
  CreateIngredientRegulatoryProfileDto,
  CreateIngredientRegulatoryProfileResponseDto,
  IngredientRegulatoryProfileResponseDto,
  UpdateIngredientRegulatoryProfileDto
} from '@ingredients/ingredient-regulatory-profile.dto'
import { IngredientRegulatoryProfileService } from '@ingredients/ingredient-regulatory-profile.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { IngredientRegulatoryProfile } from '@ingredients/ingredient-regulatory-profile.entity'

@ApiTags('Ingredient Regulatory Profiles')
@ApiBearerAuth('accessToken')
@Controller('ingredient-regulatory-profiles')
export class IngredientRegulatoryProfilesController {
  constructor(private readonly service: IngredientRegulatoryProfileService) {}

  @Post()
  @Authorize(Action.Create, IngredientRegulatoryProfile)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateIngredientRegulatoryProfileDto,
    @Req() request: Request
  ): Promise<CreateIngredientRegulatoryProfileResponseDto> {
    const profile = await this.service.create(
      {
        tenantId: dto.tenantId,
        ingredientId: dto.ingredientId,
        hasRtiq: dto.hasRtiq ?? false,
        isGmo: dto.isGmo ?? false,
        gmoIngredient: dto.gmoIngredient ?? null,
        gmoDonorSpecies: dto.gmoDonorSpecies ?? null,
        gmoPercentage: dto.gmoPercentage ?? null,
        isIrradiated: dto.isIrradiated ?? false,
        irradiatedIngredient: dto.irradiatedIngredient ?? null,
        containsLactose: dto.containsLactose ?? false,
        containsGluten: dto.containsGluten ?? false,
        containsAspartame: dto.containsAspartame ?? false,
        flavorOriginType: dto.flavorOriginType ?? null,
        colorantOriginType: dto.colorantOriginType ?? null
      },
      request.context
    )
    return CreateIngredientRegulatoryProfileResponseDto.fromDomain(profile)
  }

  @Get()
  @Authorize(Action.Read, IngredientRegulatoryProfile)
  async findAll(@Req() request: Request): Promise<IngredientRegulatoryProfileResponseDto[]> {
    const profiles = await this.service.findAll({}, request.context)
    return profiles.map(IngredientRegulatoryProfileResponseDto.fromDomain)
  }

  @Get('by-ingredient/:ingredientId')
  @Authorize(Action.Read, IngredientRegulatoryProfile)
  async findByIngredientId(
    @Param('ingredientId', ParseUUIDPipe) ingredientId: string,
    @Req() request: Request
  ): Promise<IngredientRegulatoryProfileResponseDto | null> {
    const profile = await this.service.findByIngredientId(ingredientId, request.context)
    if (!profile) return null
    return IngredientRegulatoryProfileResponseDto.fromDomain(profile)
  }

  @Get(':id')
  @Authorize(Action.Read, IngredientRegulatoryProfile)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<IngredientRegulatoryProfileResponseDto> {
    const profile = await this.service.findById(id, request.context)
    return IngredientRegulatoryProfileResponseDto.fromDomain(profile)
  }

  @Patch(':id')
  @Authorize(Action.Update, IngredientRegulatoryProfile)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIngredientRegulatoryProfileDto,
    @Req() request: Request
  ): Promise<IngredientRegulatoryProfileResponseDto> {
    const profile = await this.service.findById(id, request.context)

    if (dto.hasRtiq !== undefined) profile.changeHasRtiq(dto.hasRtiq)
    if (dto.isGmo !== undefined) profile.changeIsGmo(dto.isGmo)
    if (dto.gmoIngredient !== undefined) profile.changeGmoIngredient(dto.gmoIngredient)
    if (dto.gmoDonorSpecies !== undefined) profile.changeGmoDonorSpecies(dto.gmoDonorSpecies)
    if (dto.gmoPercentage !== undefined) profile.changeGmoPercentage(dto.gmoPercentage)
    if (dto.isIrradiated !== undefined) profile.changeIsIrradiated(dto.isIrradiated)
    if (dto.irradiatedIngredient !== undefined) profile.changeIrradiatedIngredient(dto.irradiatedIngredient)
    if (dto.containsLactose !== undefined) profile.changeContainsLactose(dto.containsLactose)
    if (dto.containsGluten !== undefined) profile.changeContainsGluten(dto.containsGluten)
    if (dto.containsAspartame !== undefined) profile.changeContainsAspartame(dto.containsAspartame)
    if (dto.flavorOriginType !== undefined) profile.changeFlavorOriginType(dto.flavorOriginType)
    if (dto.colorantOriginType !== undefined) profile.changeColorantOriginType(dto.colorantOriginType)

    const saved = await this.service.save(profile, request.context)
    return IngredientRegulatoryProfileResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, IngredientRegulatoryProfile)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, IngredientRegulatoryProfile)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<IngredientRegulatoryProfileResponseDto> {
    const profile = await this.service.activate(id, request.context)
    return IngredientRegulatoryProfileResponseDto.fromDomain(profile)
  }

  @Post(':id/lock')
  @Authorize(Action.Update, IngredientRegulatoryProfile)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<IngredientRegulatoryProfileResponseDto> {
    const profile = await this.service.lock(id, request.context)
    return IngredientRegulatoryProfileResponseDto.fromDomain(profile)
  }
}
