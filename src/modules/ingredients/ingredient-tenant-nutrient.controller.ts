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
import { IngredientTenantNutrientService } from '@ingredients/ingredient-tenant-nutrient.service'
import { IngredientTenantNutrient } from '@ingredients/ingredient-tenant-nutrient.entity'

// TODO: zod validate dto
export class CreateIngredientTenantNutrientDto {
  @ApiProperty({ type: String, required: false })
  tenantId?: string

  @ApiProperty({ type: String })
  ingredientId!: string

  @ApiProperty({ type: String })
  nutrientId!: string

  @ApiProperty({ type: String, required: false, nullable: true })
  value?: string | null
}

export class IngredientTenantNutrientResponseDto {
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

  static fromDomain(
    entry: IngredientTenantNutrient
  ): IngredientTenantNutrientResponseDto {
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

@ApiTags('Ingredient Tenant Nutrients')
@ApiBearerAuth('accessToken')
@Controller('ingredient-tenant-nutrients')
export class IngredientTenantNutrientsController {
  constructor(private readonly service: IngredientTenantNutrientService) {}

  @Post()
  @Authorize(Action.Create, IngredientTenantNutrient)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateIngredientTenantNutrientDto,
    @Req() request: Request
  ): Promise<IngredientTenantNutrientResponseDto> {
    const entry = await this.service.create(
      {
        tenantId: dto.tenantId ?? '',
        ingredientId: dto.ingredientId,
        nutrientId: dto.nutrientId,
        value:
          dto.value !== null && dto.value !== undefined
            ? parseFloat(dto.value)
            : null
      },
      request.context
    )
    return IngredientTenantNutrientResponseDto.fromDomain(entry)
  }

  @Get('by-ingredient/:ingredientId')
  @Authorize(Action.Read, IngredientTenantNutrient)
  async findByIngredientId(
    @Param('ingredientId', ParseUUIDPipe) ingredientId: string,
    @Req() request: Request
  ): Promise<IngredientTenantNutrientResponseDto[]> {
    const entries = await this.service.findByIngredientId(
      ingredientId,
      request.context
    )
    return entries.map(IngredientTenantNutrientResponseDto.fromDomain)
  }

  @Delete(':id')
  @Authorize(Action.Delete, IngredientTenantNutrient)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.remove(id, request.context)
  }
}
