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
  CreateIngredientDto,
  CreateIngredientResponseDto,
  IngredientResponseDto,
  UpdateIngredientDto,
  SaveAllIngredientDto
} from '@ingredients/ingredient.dto'
import { IngredientService } from '@ingredients/ingredient.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { Ingredient } from '@ingredients/ingredient.entity'

@ApiTags('Ingredients')
@ApiBearerAuth('accessToken')
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly service: IngredientService) {}

  @Post()
  @Authorize(Action.Create, Ingredient)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateIngredientDto,
    @Req() request: Request
  ): Promise<CreateIngredientResponseDto> {
    const ingredient = await this.service.create(
      {
        tenantId: dto.tenantId,
        code: dto.code,
        functionalName: dto.functionalName,
        commercialName: dto.commercialName ?? null,
        saleName: dto.saleName ?? null,
        functionalGroupId: dto.functionalGroupId ?? null,
        ingredientFunction: dto.ingredientFunction,
        notes: dto.notes ?? null,
        manufacturerId: dto.manufacturerId ?? null,
        supplierId: dto.supplierId ?? null,
        technicalSourceId: dto.technicalSourceId ?? null,
        usageIndication: dto.usageIndication ?? null,
        ingredientsListDesc: dto.ingredientsListDesc ?? null
      },
      request.context
    )
    return CreateIngredientResponseDto.fromDomain(ingredient)
  }

  @Get()
  @Authorize(Action.Read, Ingredient)
  async findAll(@Req() request: Request): Promise<IngredientResponseDto[]> {
    const ingredients = await this.service.findAll({}, request.context)
    return ingredients.map(IngredientResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, Ingredient)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<IngredientResponseDto> {
    const ingredient = await this.service.findById(id, request.context)
    return IngredientResponseDto.fromDomain(ingredient)
  }

  @Patch(':id')
  @Authorize(Action.Update, Ingredient)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIngredientDto,
    @Req() request: Request
  ): Promise<IngredientResponseDto> {
    const ingredient = await this.service.findById(id, request.context)

    if (dto.code !== undefined) ingredient.changeCode(dto.code)
    if (dto.functionalName !== undefined) ingredient.changeFunctionalName(dto.functionalName)
    if (dto.commercialName !== undefined) ingredient.changeCommercialName(dto.commercialName)
    if (dto.saleName !== undefined) ingredient.changeSaleName(dto.saleName)
    if (dto.functionalGroupId !== undefined) ingredient.changeFunctionalGroup(dto.functionalGroupId)
    if (dto.ingredientFunction) ingredient.changeIngredientFunction(dto.ingredientFunction)
    if (dto.notes !== undefined) ingredient.changeNotes(dto.notes)
    if (dto.manufacturerId !== undefined) ingredient.changeManufacturer(dto.manufacturerId)
    if (dto.supplierId !== undefined) ingredient.changeSupplier(dto.supplierId)
    if (dto.technicalSourceId !== undefined) ingredient.changeTechnicalSource(dto.technicalSourceId)
    if (dto.usageIndication !== undefined) ingredient.changeUsageIndication(dto.usageIndication)
    if (dto.ingredientsListDesc !== undefined) ingredient.changeIngredientsListDesc(dto.ingredientsListDesc)

    const saved = await this.service.save(ingredient, request.context)
    return IngredientResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, Ingredient)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, Ingredient)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<IngredientResponseDto> {
    const ingredient = await this.service.activate(id, request.context)
    return IngredientResponseDto.fromDomain(ingredient)
  }

  @Post(':id/lock')
  @Authorize(Action.Update, Ingredient)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<IngredientResponseDto> {
    const ingredient = await this.service.lock(id, request.context)
    return IngredientResponseDto.fromDomain(ingredient)
  }

  @Post(':id/save')
  @Authorize(Action.Update, Ingredient)
  @ApiConsumes('application/json')
  async saveAll(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SaveAllIngredientDto,
    @Req() request: Request
  ): Promise<IngredientResponseDto> {
    const ingredient = await this.service.saveAll(id, dto, request.context)
    return IngredientResponseDto.fromDomain(ingredient)
  }
}
