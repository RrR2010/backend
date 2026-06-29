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
  CreateIngredientFlag_TEDto,
  CreateIngredientFlag_TE_ResponseDto,
  IngredientFlag_TE_ResponseDto,
  UpdateIngredientFlag_TEDto
} from '@ingredients/ingredient-flag-te.dto'
import { IngredientFlag_TEService } from '@ingredients/ingredient-flag-te.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { IngredientFlag_TE } from '@ingredients/ingredient-flag-te.entity'

@ApiTags('Ingredient Flags (TE)')
@ApiBearerAuth('accessToken')
@Controller('ingredient-flags')
export class IngredientFlag_TEController {
  constructor(private readonly service: IngredientFlag_TEService) {}

  @Post()
  @Authorize(Action.Create, IngredientFlag_TE)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateIngredientFlag_TEDto,
    @Req() request: Request
  ): Promise<CreateIngredientFlag_TE_ResponseDto> {
    const entry = await this.service.create(
      {
        ingredientId: dto.ingredientId,
        flagId: dto.flagId,
        flagValue: dto.flagValue,
        notes: dto.notes ?? null
      },
      request.context
    )
    return CreateIngredientFlag_TE_ResponseDto.fromDomain(entry)
  }

  @Get()
  @Authorize(Action.Read, IngredientFlag_TE)
  async findAll(
    @Req() request: Request
  ): Promise<IngredientFlag_TE_ResponseDto[]> {
    const entries = await this.service.findAll({}, request.context)
    return entries.map(IngredientFlag_TE_ResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, IngredientFlag_TE)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<IngredientFlag_TE_ResponseDto> {
    const entry = await this.service.findById(id, request.context)
    return IngredientFlag_TE_ResponseDto.fromDomain(entry)
  }

  @Patch(':id')
  @Authorize(Action.Update, IngredientFlag_TE)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIngredientFlag_TEDto,
    @Req() request: Request
  ): Promise<IngredientFlag_TE_ResponseDto> {
    const entry = await this.service.findById(id, request.context)

    if (dto.flagValue !== undefined) entry.changeFlagValue(dto.flagValue)
    if (dto.notes !== undefined) entry.changeNotes(dto.notes)

    const saved = await this.service.save(entry, request.context)
    return IngredientFlag_TE_ResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, IngredientFlag_TE)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, IngredientFlag_TE)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<IngredientFlag_TE_ResponseDto> {
    const entry = await this.service.activate(id, request.context)
    return IngredientFlag_TE_ResponseDto.fromDomain(entry)
  }

  @Post(':id/lock')
  @Authorize(Action.Update, IngredientFlag_TE)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<IngredientFlag_TE_ResponseDto> {
    const entry = await this.service.lock(id, request.context)
    return IngredientFlag_TE_ResponseDto.fromDomain(entry)
  }

  @Post(':id/unlock')
  @Authorize(Action.Unlock, IngredientFlag_TE)
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<IngredientFlag_TE_ResponseDto> {
    const entry = await this.service.unlock(id, request.context)
    return IngredientFlag_TE_ResponseDto.fromDomain(entry)
  }
}
