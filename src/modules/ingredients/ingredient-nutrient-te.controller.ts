import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req
} from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { IngredientNutrient_TEService } from '@ingredients/ingredient-nutrient-te.service'
import { IngredientNutrient_TE } from '@ingredients/ingredient-nutrient-te.entity'
import {
  CreateIngredientNutrient_TEDto,
  IngredientNutrient_TE_ResponseDto
} from '@ingredients/ingredient-nutrient-te.dto'

@ApiTags('Ingredient Nutrients (TE)')
@ApiBearerAuth('accessToken')
@Controller('ingredient-nutrients')
export class IngredientNutrient_TEController {
  constructor(
    private readonly service: IngredientNutrient_TEService
  ) {}

  @Post()
  @Authorize(Action.Create, IngredientNutrient_TE)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateIngredientNutrient_TEDto,
    @Req() request: Request
  ): Promise<IngredientNutrient_TE_ResponseDto> {
    const entry = await this.service.create(
      {
        tenantId: dto.tenantId ?? '',
        ingredientId: dto.ingredientId,
        nutrientId: dto.nutrientId,
        value:
          dto.value !== null && dto.value !== undefined
            ? dto.value
            : null,
        sourceId:
          dto.sourceId !== null && dto.sourceId !== undefined
            ? dto.sourceId
            : null
      },
      request.context
    )
    return IngredientNutrient_TE_ResponseDto.fromDomain(entry)
  }

  @Get('by-ingredient/:ingredientId')
  @Authorize(Action.Read, IngredientNutrient_TE)
  async findByIngredientId(
    @Param('ingredientId', ParseUUIDPipe) ingredientId: string,
    @Req() request: Request
  ): Promise<IngredientNutrient_TE_ResponseDto[]> {
    const entries = await this.service.findByIngredientId(
      ingredientId,
      request.context
    )
    return entries.map(IngredientNutrient_TE_ResponseDto.fromDomain)
  }

  @Get('by-nutrient/:nutrientId')
  @Authorize(Action.Read, IngredientNutrient_TE)
  async findByNutrientId(
    @Param('nutrientId', ParseUUIDPipe) nutrientId: string,
    @Req() request: Request
  ): Promise<IngredientNutrient_TE_ResponseDto[]> {
    const entries = await this.service.findByNutrientId(
      nutrientId,
      request.context
    )
    return entries.map(IngredientNutrient_TE_ResponseDto.fromDomain)
  }

  @Delete(':id')
  @Authorize(Action.Delete, IngredientNutrient_TE)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.remove(id, request.context)
  }
}
