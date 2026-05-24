import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Req } from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiProperty, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { AllergenRelationType } from '@prisma/client'
import { IngredientAllergenService } from '@ingredients/ingredient-allergen.service'
import { IngredientAllergen } from '@ingredients/ingredient-allergen.entity'

// TODO: zod validate dto
export class CreateIngredientAllergenDto {
  @ApiProperty({ type: String, required: false })
  tenantId?: string

  @ApiProperty({ type: String })
  ingredientId!: string

  @ApiProperty({ type: String })
  allergenId!: string

  @ApiProperty({ enum: AllergenRelationType, enumName: 'AllergenRelationType' })
  relationType!: AllergenRelationType
}

export class IngredientAllergenResponseDto {
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
  allergenId!: string

  @ApiProperty({ enum: AllergenRelationType, enumName: 'AllergenRelationType' })
  relationType!: AllergenRelationType

  static fromDomain(entry: IngredientAllergen): IngredientAllergenResponseDto {
    return {
      id: entry.id.value,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      tenantId: entry.tenantId,
      ingredientId: entry.ingredientId,
      allergenId: entry.allergenId,
      relationType: entry.relationType
    }
  }
}

@ApiTags('Ingredient Allergens')
@ApiBearerAuth('accessToken')
@Controller('ingredient-allergens')
export class IngredientAllergensController {
  constructor(private readonly service: IngredientAllergenService) {}

  @Post()
  @Authorize(Action.Create, IngredientAllergen)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateIngredientAllergenDto,
    @Req() request: Request
  ): Promise<IngredientAllergenResponseDto> {
    const entry = await this.service.create(
      {
        tenantId: dto.tenantId ?? '',
        ingredientId: dto.ingredientId,
        allergenId: dto.allergenId,
        relationType: dto.relationType
      },
      request.context
    )
    return IngredientAllergenResponseDto.fromDomain(entry)
  }

  @Get('by-ingredient/:ingredientId')
  @Authorize(Action.Read, IngredientAllergen)
  async findByIngredientId(
    @Param('ingredientId', ParseUUIDPipe) ingredientId: string,
    @Req() request: Request
  ): Promise<IngredientAllergenResponseDto[]> {
    const entries = await this.service.findByIngredientId(ingredientId, request.context)
    return entries.map(IngredientAllergenResponseDto.fromDomain)
  }

  @Delete(':id')
  @Authorize(Action.Delete, IngredientAllergen)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.remove(id, request.context)
  }
}
