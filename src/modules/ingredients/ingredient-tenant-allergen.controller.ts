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
import { AllergenRelationType } from '@prisma/client'
import { IngredientTenantAllergenService } from '@ingredients/ingredient-tenant-allergen.service'
import { IngredientTenantAllergen } from '@ingredients/ingredient-tenant-allergen.entity'

// TODO: zod validate dto
export class CreateIngredientTenantAllergenDto {
  @ApiProperty({ type: String, required: false })
  tenantId?: string

  @ApiProperty({ type: String })
  ingredientId!: string

  @ApiProperty({ type: String })
  allergenId!: string

  @ApiProperty({ enum: AllergenRelationType, enumName: 'AllergenRelationType' })
  relationType!: AllergenRelationType
}

export class IngredientTenantAllergenResponseDto {
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

  static fromDomain(
    entry: IngredientTenantAllergen
  ): IngredientTenantAllergenResponseDto {
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

@ApiTags('Ingredient Tenant Allergens')
@ApiBearerAuth('accessToken')
@Controller('ingredient-tenant-allergens')
export class IngredientTenantAllergensController {
  constructor(private readonly service: IngredientTenantAllergenService) {}

  @Post()
  @Authorize(Action.Create, IngredientTenantAllergen)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateIngredientTenantAllergenDto,
    @Req() request: Request
  ): Promise<IngredientTenantAllergenResponseDto> {
    const entry = await this.service.create(
      {
        tenantId: dto.tenantId ?? '',
        ingredientId: dto.ingredientId,
        allergenId: dto.allergenId,
        relationType: dto.relationType
      },
      request.context
    )
    return IngredientTenantAllergenResponseDto.fromDomain(entry)
  }

  @Get('by-ingredient/:ingredientId')
  @Authorize(Action.Read, IngredientTenantAllergen)
  async findByIngredientId(
    @Param('ingredientId', ParseUUIDPipe) ingredientId: string,
    @Req() request: Request
  ): Promise<IngredientTenantAllergenResponseDto[]> {
    const entries = await this.service.findByIngredientId(
      ingredientId,
      request.context
    )
    return entries.map(IngredientTenantAllergenResponseDto.fromDomain)
  }

  @Delete(':id')
  @Authorize(Action.Delete, IngredientTenantAllergen)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.remove(id, request.context)
  }
}
