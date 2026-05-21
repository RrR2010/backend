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
  CreateIngredientLabelingProfileDto,
  CreateIngredientLabelingProfileResponseDto,
  IngredientLabelingProfileResponseDto,
  UpdateIngredientLabelingProfileDto
} from '@ingredients/ingredient-labeling-profile.dto'
import { IngredientLabelingProfileService } from '@ingredients/ingredient-labeling-profile.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { IngredientLabelingProfile } from '@ingredients/ingredient-labeling-profile.entity'

@ApiTags('Ingredient Labeling Profiles')
@ApiBearerAuth('accessToken')
@Controller('ingredient-labeling-profiles')
export class IngredientLabelingProfilesController {
  constructor(private readonly service: IngredientLabelingProfileService) {}

  @Post()
  @Authorize(Action.Create, IngredientLabelingProfile)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateIngredientLabelingProfileDto,
    @Req() request: Request
  ): Promise<CreateIngredientLabelingProfileResponseDto> {
    const profile = await this.service.create(
      {
        tenantId: dto.tenantId,
        ingredientId: dto.ingredientId,
        containsAddedSugars: dto.containsAddedSugars ?? false,
        containsIngredientWithAddedSugars: dto.containsIngredientWithAddedSugars ?? false,
        containsNaturallyOccurringSugarSubstitutes: dto.containsNaturallyOccurringSugarSubstitutes ?? false,
        usesProcessingThatIncreasesSugars: dto.usesProcessingThatIncreasesSugars ?? false,
        containsAddedFatsOrOils: dto.containsAddedFatsOrOils ?? false,
        containsButterOrMargarine: dto.containsButterOrMargarine ?? false,
        containsDairyCream: dto.containsDairyCream ?? false,
        containsIngredientsWithFatsOrCream: dto.containsIngredientsWithFatsOrCream ?? false
      },
      request.context
    )
    return CreateIngredientLabelingProfileResponseDto.fromDomain(profile)
  }

  @Get()
  @Authorize(Action.Read, IngredientLabelingProfile)
  async findAll(@Req() request: Request): Promise<IngredientLabelingProfileResponseDto[]> {
    const profiles = await this.service.findAll({}, request.context)
    return profiles.map(IngredientLabelingProfileResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, IngredientLabelingProfile)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<IngredientLabelingProfileResponseDto> {
    const profile = await this.service.findById(id, request.context)
    return IngredientLabelingProfileResponseDto.fromDomain(profile)
  }

  @Patch(':id')
  @Authorize(Action.Update, IngredientLabelingProfile)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIngredientLabelingProfileDto,
    @Req() request: Request
  ): Promise<IngredientLabelingProfileResponseDto> {
    const profile = await this.service.findById(id, request.context)

    if (dto.containsAddedSugars !== undefined) profile.changeContainsAddedSugars(dto.containsAddedSugars)
    if (dto.containsIngredientWithAddedSugars !== undefined) profile.changeContainsIngredientWithAddedSugars(dto.containsIngredientWithAddedSugars)
    if (dto.containsNaturallyOccurringSugarSubstitutes !== undefined) profile.changeContainsNaturallyOccurringSugarSubstitutes(dto.containsNaturallyOccurringSugarSubstitutes)
    if (dto.usesProcessingThatIncreasesSugars !== undefined) profile.changeUsesProcessingThatIncreasesSugars(dto.usesProcessingThatIncreasesSugars)
    if (dto.containsAddedFatsOrOils !== undefined) profile.changeContainsAddedFatsOrOils(dto.containsAddedFatsOrOils)
    if (dto.containsButterOrMargarine !== undefined) profile.changeContainsButterOrMargarine(dto.containsButterOrMargarine)
    if (dto.containsDairyCream !== undefined) profile.changeContainsDairyCream(dto.containsDairyCream)
    if (dto.containsIngredientsWithFatsOrCream !== undefined) profile.changeContainsIngredientsWithFatsOrCream(dto.containsIngredientsWithFatsOrCream)

    const saved = await this.service.save(profile, request.context)
    return IngredientLabelingProfileResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, IngredientLabelingProfile)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, IngredientLabelingProfile)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<IngredientLabelingProfileResponseDto> {
    const profile = await this.service.activate(id, request.context)
    return IngredientLabelingProfileResponseDto.fromDomain(profile)
  }

  @Post(':id/lock')
  @Authorize(Action.Update, IngredientLabelingProfile)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<IngredientLabelingProfileResponseDto> {
    const profile = await this.service.lock(id, request.context)
    return IngredientLabelingProfileResponseDto.fromDomain(profile)
  }
}
