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
  CreateIngredientTechnicalProfileDto,
  CreateIngredientTechnicalProfileResponseDto,
  IngredientTechnicalProfileResponseDto,
  UpdateIngredientTechnicalProfileDto
} from '@ingredients/ingredient-technical-profile.dto'
import { IngredientTechnicalProfileService } from '@ingredients/ingredient-technical-profile.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { IngredientTechnicalProfile } from '@ingredients/ingredient-technical-profile.entity'

@ApiTags('Ingredient Technical Profiles')
@ApiBearerAuth('accessToken')
@Controller('ingredient-technical-profiles')
export class IngredientTechnicalProfilesController {
  constructor(private readonly service: IngredientTechnicalProfileService) {}

  @Post()
  @Authorize(Action.Create, IngredientTechnicalProfile)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateIngredientTechnicalProfileDto,
    @Req() request: Request
  ): Promise<CreateIngredientTechnicalProfileResponseDto> {
    const profile = await this.service.create(
      {
        tenantId: dto.tenantId,
        ingredientId: dto.ingredientId,
        pac: dto.pac ?? null,
        pod: dto.pod ?? null,
        totalSolids: dto.totalSolids ?? null,
        ashContent: dto.ashContent ?? null
      },
      request.context
    )
    return CreateIngredientTechnicalProfileResponseDto.fromDomain(profile)
  }

  @Get()
  @Authorize(Action.Read, IngredientTechnicalProfile)
  async findAll(
    @Req() request: Request
  ): Promise<IngredientTechnicalProfileResponseDto[]> {
    const profiles = await this.service.findAll({}, request.context)
    return profiles.map(IngredientTechnicalProfileResponseDto.fromDomain)
  }

  @Get('by-ingredient/:ingredientId')
  @Authorize(Action.Read, IngredientTechnicalProfile)
  async findByIngredientId(
    @Param('ingredientId', ParseUUIDPipe) ingredientId: string,
    @Req() request: Request
  ): Promise<IngredientTechnicalProfileResponseDto | null> {
    const profile = await this.service.findByIngredientId(
      ingredientId,
      request.context
    )
    if (!profile) return null
    return IngredientTechnicalProfileResponseDto.fromDomain(profile)
  }

  @Get(':id')
  @Authorize(Action.Read, IngredientTechnicalProfile)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<IngredientTechnicalProfileResponseDto> {
    const profile = await this.service.findById(id, request.context)
    return IngredientTechnicalProfileResponseDto.fromDomain(profile)
  }

  @Patch(':id')
  @Authorize(Action.Update, IngredientTechnicalProfile)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIngredientTechnicalProfileDto,
    @Req() request: Request
  ): Promise<IngredientTechnicalProfileResponseDto> {
    const profile = await this.service.findById(id, request.context)

    if (dto.pac !== undefined) profile.changePac(dto.pac)
    if (dto.pod !== undefined) profile.changePod(dto.pod)
    if (dto.totalSolids !== undefined)
      profile.changeTotalSolids(dto.totalSolids)
    if (dto.ashContent !== undefined) profile.changeAshContent(dto.ashContent)

    const saved = await this.service.save(profile, request.context)
    return IngredientTechnicalProfileResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, IngredientTechnicalProfile)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, IngredientTechnicalProfile)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<IngredientTechnicalProfileResponseDto> {
    const profile = await this.service.activate(id, request.context)
    return IngredientTechnicalProfileResponseDto.fromDomain(profile)
  }

  @Post(':id/lock')
  @Authorize(Action.Update, IngredientTechnicalProfile)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<IngredientTechnicalProfileResponseDto> {
    const profile = await this.service.lock(id, request.context)
    return IngredientTechnicalProfileResponseDto.fromDomain(profile)
  }

  @Post(':id/unlock')
  @Authorize(Action.Unlock, IngredientTechnicalProfile)
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<IngredientTechnicalProfileResponseDto> {
    const profile = await this.service.unlock(id, request.context)
    return IngredientTechnicalProfileResponseDto.fromDomain(profile)
  }
}
