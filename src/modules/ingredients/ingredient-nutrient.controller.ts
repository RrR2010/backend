import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Req } from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiProperty, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { IngredientNutrientService } from '@ingredients/ingredient-nutrient.service'
import { IngredientNutrient } from '@ingredients/ingredient-nutrient.entity'

// TODO: zod validate dto
export class CreateIngredientNutrientDto {
  @ApiProperty({ type: String, required: false })
  tenantId?: string

  @ApiProperty({ type: String })
  ingredientId!: string

  @ApiProperty({ type: String })
  nutrientId!: string

  @ApiProperty({ type: String, required: false, nullable: true })
  value?: string | null
}

export class IngredientNutrientResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  @ApiProperty()
  tenantId!: string

  @ApiProperty()
  ingredientId!: string

  @ApiProperty()
  nutrientId!: string

  @ApiProperty({ required: false, nullable: true })
  value!: string | null

  static fromDomain(entry: IngredientNutrient): IngredientNutrientResponseDto {
    return {
      id: entry.id.value,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      tenantId: entry.tenantId,
      ingredientId: entry.ingredientId,
      nutrientId: entry.nutrientId,
      value: entry.value !== null ? entry.value.toString() : null
    }
  }
}

@ApiTags('Ingredient Nutrients')
@ApiBearerAuth('accessToken')
@Controller('ingredient-nutrients')
export class IngredientNutrientsController {
  constructor(private readonly service: IngredientNutrientService) {}

  @Post()
  @Authorize(Action.Create, IngredientNutrient)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateIngredientNutrientDto,
    @Req() request: Request
  ): Promise<IngredientNutrientResponseDto> {
    const entry = await this.service.create(
      {
        tenantId: dto.tenantId ?? '',
        ingredientId: dto.ingredientId,
        nutrientId: dto.nutrientId,
        value: dto.value !== null && dto.value !== undefined ? parseFloat(dto.value) : null
      },
      request.context
    )
    return IngredientNutrientResponseDto.fromDomain(entry)
  }

  @Get('by-ingredient/:ingredientId')
  @Authorize(Action.Read, IngredientNutrient)
  async findByIngredientId(
    @Param('ingredientId', ParseUUIDPipe) ingredientId: string,
    @Req() request: Request
  ): Promise<IngredientNutrientResponseDto[]> {
    const entries = await this.service.findByIngredientId(ingredientId, request.context)
    return entries.map(IngredientNutrientResponseDto.fromDomain)
  }

  @Delete(':id')
  @Authorize(Action.Delete, IngredientNutrient)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.remove(id, request.context)
  }
}
