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
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiProperty,
  ApiTags
} from '@nestjs/swagger'
import type { Request } from 'express'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { IngredientBaseNutrientService } from '@ingredients/ingredient-base-nutrient.service'
import { IngredientBaseNutrient } from '@ingredients/ingredient-base-nutrient.entity'

// TODO: zod validate dto
export class CreateIngredientBaseNutrientDto {
  @ApiProperty({ type: String })
  ingredientId!: string

  @ApiProperty({ type: String })
  baseNutrientId!: string

  @ApiProperty({ type: String, required: false, nullable: true })
  value?: string | null
}

export class IngredientBaseNutrientResponseDto {
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
  baseNutrientId!: string

  @ApiProperty({ required: false, nullable: true })
  value!: string | null

  static fromDomain(
    entry: IngredientBaseNutrient
  ): IngredientBaseNutrientResponseDto {
    return {
      id: entry.id.value,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      tenantId: entry.tenantId,
      ingredientId: entry.ingredientId,
      baseNutrientId: entry.baseNutrientId,
      value: entry.value !== null ? entry.value.toString() : null
    }
  }
}

@ApiTags('Ingredient Base Nutrients')
@ApiBearerAuth('accessToken')
@Controller('ingredient-base-nutrients')
export class IngredientBaseNutrientsController {
  constructor(private readonly service: IngredientBaseNutrientService) {}

  @Post()
  @Authorize(Action.Create, IngredientBaseNutrient)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateIngredientBaseNutrientDto,
    @Req() request: Request
  ): Promise<IngredientBaseNutrientResponseDto> {
    const tenantId =
      request.context.scope === UserScope.TENANT ? request.context.tenantId : ''
    const entry = await this.service.create(
      {
        tenantId,
        ingredientId: dto.ingredientId,
        baseNutrientId: dto.baseNutrientId,
        value:
          dto.value !== null && dto.value !== undefined
            ? parseFloat(dto.value)
            : null
      },
      request.context
    )
    return IngredientBaseNutrientResponseDto.fromDomain(entry)
  }

  @Get('by-ingredient/:ingredientId')
  @Authorize(Action.Read, IngredientBaseNutrient)
  async findByIngredientId(
    @Param('ingredientId', ParseUUIDPipe) ingredientId: string,
    @Req() request: Request
  ): Promise<IngredientBaseNutrientResponseDto[]> {
    const entries = await this.service.findByIngredientId(
      ingredientId,
      request.context
    )
    return entries.map((e) => IngredientBaseNutrientResponseDto.fromDomain(e))
  }

  @Delete(':id')
  @Authorize(Action.Delete, IngredientBaseNutrient)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.remove(id, request.context)
  }
}
