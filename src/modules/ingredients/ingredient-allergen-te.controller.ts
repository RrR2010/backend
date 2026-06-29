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
import { IngredientAllergen_TEService } from '@ingredients/ingredient-allergen-te.service'
import { IngredientAllergen_TE } from '@ingredients/ingredient-allergen-te.entity'
import {
  CreateIngredientAllergen_TEDto,
  IngredientAllergen_TE_ResponseDto
} from '@ingredients/ingredient-allergen-te.dto'

@ApiTags('Ingredient Allergens (TE)')
@ApiBearerAuth('accessToken')
@Controller('ingredient-allergens')
export class IngredientAllergen_TEController {
  constructor(
    private readonly service: IngredientAllergen_TEService
  ) {}

  @Post()
  @Authorize(Action.Create, IngredientAllergen_TE)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateIngredientAllergen_TEDto,
    @Req() request: Request
  ): Promise<IngredientAllergen_TE_ResponseDto> {
    const entry = await this.service.create(
      {
        ingredientId: dto.ingredientId,
        allergenId: dto.allergenId,
        relationType: dto.relationType
      },
      request.context
    )
    return IngredientAllergen_TE_ResponseDto.fromDomain(entry)
  }

  @Get('by-ingredient/:ingredientId')
  @Authorize(Action.Read, IngredientAllergen_TE)
  async findByIngredientId(
    @Param('ingredientId', ParseUUIDPipe) ingredientId: string,
    @Req() request: Request
  ): Promise<IngredientAllergen_TE_ResponseDto[]> {
    const entries = await this.service.findByIngredientId(
      ingredientId,
      request.context
    )
    return entries.map(IngredientAllergen_TE_ResponseDto.fromDomain)
  }

  @Delete(':id')
  @Authorize(Action.Delete, IngredientAllergen_TE)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.remove(id, request.context)
  }
}
