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
import { AllergenRelationType } from '@prisma/client'
import { IngredientBaseAllergenService } from '@ingredients/ingredient-base-allergen.service'
import { IngredientBaseAllergen } from '@ingredients/ingredient-base-allergen.entity'

// TODO: zod validate dto
export class CreateIngredientBaseAllergenDto {
  @ApiProperty({ type: String })
  ingredientId!: string

  @ApiProperty({ type: String })
  baseAllergenId!: string

  @ApiProperty({ enum: AllergenRelationType, enumName: 'AllergenRelationType' })
  relationType!: AllergenRelationType
}

export class IngredientBaseAllergenResponseDto {
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
  baseAllergenId!: string

  @ApiProperty({ enum: AllergenRelationType, enumName: 'AllergenRelationType' })
  relationType!: AllergenRelationType

  static fromDomain(
    entry: IngredientBaseAllergen
  ): IngredientBaseAllergenResponseDto {
    return {
      id: entry.id.value,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      tenantId: entry.tenantId,
      ingredientId: entry.ingredientId,
      baseAllergenId: entry.baseAllergenId,
      relationType: entry.relationType
    }
  }
}

@ApiTags('Ingredient Base Allergens')
@ApiBearerAuth('accessToken')
@Controller('ingredient-base-allergens')
export class IngredientBaseAllergensController {
  constructor(private readonly service: IngredientBaseAllergenService) {}

  @Post()
  @Authorize(Action.Create, IngredientBaseAllergen)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateIngredientBaseAllergenDto,
    @Req() request: Request
  ): Promise<IngredientBaseAllergenResponseDto> {
    const tenantId =
      request.context.scope === UserScope.TENANT ? request.context.tenantId : ''
    const entry = await this.service.create(
      {
        tenantId,
        ingredientId: dto.ingredientId,
        baseAllergenId: dto.baseAllergenId,
        relationType: dto.relationType
      },
      request.context
    )
    return IngredientBaseAllergenResponseDto.fromDomain(entry)
  }

  @Get('by-ingredient/:ingredientId')
  @Authorize(Action.Read, IngredientBaseAllergen)
  async findByIngredientId(
    @Param('ingredientId', ParseUUIDPipe) ingredientId: string,
    @Req() request: Request
  ): Promise<IngredientBaseAllergenResponseDto[]> {
    const entries = await this.service.findByIngredientId(
      ingredientId,
      request.context
    )
    return entries.map((e) => IngredientBaseAllergenResponseDto.fromDomain(e))
  }

  @Delete(':id')
  @Authorize(Action.Delete, IngredientBaseAllergen)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.remove(id, request.context)
  }
}
