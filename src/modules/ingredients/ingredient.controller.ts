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
import { Ingredient_TE } from '@ingredients/ingredient.entity'

@ApiTags('Ingredients')
@ApiBearerAuth('accessToken')
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly service: IngredientService) {}

  @Post()
  @Authorize(Action.Create, Ingredient_TE)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateIngredientDto,
    @Req() request: Request
  ): Promise<CreateIngredientResponseDto> {
    const ingredient = await this.service.create(
      {
        tenantId: dto.tenantId,
        code: dto.code,
        externalCode: dto.externalCode ?? null,
        internalName: dto.internalName,
        commercialName: dto.commercialName ?? null,
        saleDenomination: dto.saleDenomination ?? null,
        functionalGroupId: dto.functionalGroupId ?? null,
        ingredientFunction: dto.ingredientFunction,
        notes: dto.notes ?? null,
        manufacturerId: dto.manufacturerId ?? null,
        supplierId: dto.supplierId ?? null,
        technicalSourceId: dto.technicalSourceId ?? null,
        usageIndication: dto.usageIndication ?? null,
        ingredientsListDesc: dto.ingredientsListDesc ?? null,

        // Regulatory Profile
        hasRtiqPiq: dto.hasRtiqPiq ?? false,
        gmoIngredient: dto.gmoIngredient ?? null,
        gmoDonorSpecies: dto.gmoDonorSpecies ?? null,
        gmoPercentage: dto.gmoPercentage ?? null,
        irradiatedIngredient: dto.irradiatedIngredient ?? null,
        flavorOriginType: dto.flavorOriginType ?? null,
        colorantOriginType: dto.colorantOriginType ?? null,

        // Labeling Profile
        containsAddedSugars: dto.containsAddedSugars ?? false,
        containsIngredientWithAddedSugars:
          dto.containsIngredientWithAddedSugars ?? false,
        containsNaturallyOccurringSugarSubstitutes:
          dto.containsNaturallyOccurringSugarSubstitutes ?? false,
        usesProcessingThatIncreasesSugars:
          dto.usesProcessingThatIncreasesSugars ?? false,
        containsAddedFatsOrOils: dto.containsAddedFatsOrOils ?? false,
        containsButterOrMargarine: dto.containsButterOrMargarine ?? false,
        containsDairyCream: dto.containsDairyCream ?? false,
        containsIngredientsWithFatsOrCream:
          dto.containsIngredientsWithFatsOrCream ?? false,

        // Technical Profile
        pac: dto.pac ?? null,
        pod: dto.pod ?? null,
        totalSolids: dto.totalSolids ?? null,
        ashContent: dto.ashContent ?? null
      },
      request.context
    )
    return CreateIngredientResponseDto.fromDomain(ingredient)
  }

  @Get()
  @Authorize(Action.Read, Ingredient_TE)
  async findAll(@Req() request: Request): Promise<IngredientResponseDto[]> {
    const ingredients = await this.service.findAll({}, request.context)
    return ingredients.map(IngredientResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, Ingredient_TE)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<IngredientResponseDto> {
    const ingredient = await this.service.findById(id, request.context)
    return IngredientResponseDto.fromDomain(ingredient)
  }

  @Patch(':id')
  @Authorize(Action.Update, Ingredient_TE)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIngredientDto,
    @Req() request: Request
  ): Promise<IngredientResponseDto> {
    const ingredient = await this.service.findById(id, request.context)

    if (dto.code !== undefined) ingredient.changeCode(dto.code)
    if (dto.externalCode !== undefined)
      ingredient.changeExternalCode(dto.externalCode)
    if (dto.internalName !== undefined)
      ingredient.changeInternalName(dto.internalName)
    if (dto.commercialName !== undefined)
      ingredient.changeCommercialName(dto.commercialName)
    if (dto.saleDenomination !== undefined)
      ingredient.changeSaleDenomination(dto.saleDenomination)
    if (dto.functionalGroupId !== undefined)
      ingredient.changeFunctionalGroup(dto.functionalGroupId)
    if (dto.ingredientFunction !== undefined)
      ingredient.changeIngredientFunction(dto.ingredientFunction)
    if (dto.notes !== undefined) ingredient.changeNotes(dto.notes)
    if (dto.manufacturerId !== undefined)
      ingredient.changeManufacturer(dto.manufacturerId)
    if (dto.supplierId !== undefined) ingredient.changeSupplier(dto.supplierId)
    if (dto.technicalSourceId !== undefined)
      ingredient.changeTechnicalSource(dto.technicalSourceId)
    if (dto.usageIndication !== undefined)
      ingredient.changeUsageIndication(dto.usageIndication)
    if (dto.ingredientsListDesc !== undefined)
      ingredient.changeIngredientsListDesc(dto.ingredientsListDesc)

    // Regulatory Profile
    if (dto.hasRtiqPiq !== undefined)
      ingredient.changeHasRtiqPiq(dto.hasRtiqPiq)
    if (dto.gmoIngredient !== undefined)
      ingredient.changeGmoIngredient(dto.gmoIngredient)
    if (dto.gmoDonorSpecies !== undefined)
      ingredient.changeGmoDonorSpecies(dto.gmoDonorSpecies)
    if (dto.gmoPercentage !== undefined)
      ingredient.changeGmoPercentage(dto.gmoPercentage)
    if (dto.irradiatedIngredient !== undefined)
      ingredient.changeIrradiatedIngredient(dto.irradiatedIngredient)
    if (dto.flavorOriginType !== undefined)
      ingredient.changeFlavorOriginType(dto.flavorOriginType)
    if (dto.colorantOriginType !== undefined)
      ingredient.changeColorantOriginType(dto.colorantOriginType)

    // Labeling Profile
    if (dto.containsAddedSugars !== undefined)
      ingredient.changeContainsAddedSugars(dto.containsAddedSugars)
    if (dto.containsIngredientWithAddedSugars !== undefined)
      ingredient.changeContainsIngredientWithAddedSugars(
        dto.containsIngredientWithAddedSugars
      )
    if (dto.containsNaturallyOccurringSugarSubstitutes !== undefined)
      ingredient.changeContainsNaturallyOccurringSugarSubstitutes(
        dto.containsNaturallyOccurringSugarSubstitutes
      )
    if (dto.usesProcessingThatIncreasesSugars !== undefined)
      ingredient.changeUsesProcessingThatIncreasesSugars(
        dto.usesProcessingThatIncreasesSugars
      )
    if (dto.containsAddedFatsOrOils !== undefined)
      ingredient.changeContainsAddedFatsOrOils(dto.containsAddedFatsOrOils)
    if (dto.containsButterOrMargarine !== undefined)
      ingredient.changeContainsButterOrMargarine(dto.containsButterOrMargarine)
    if (dto.containsDairyCream !== undefined)
      ingredient.changeContainsDairyCream(dto.containsDairyCream)
    if (dto.containsIngredientsWithFatsOrCream !== undefined)
      ingredient.changeContainsIngredientsWithFatsOrCream(
        dto.containsIngredientsWithFatsOrCream
      )

    // Technical Profile
    if (dto.pac !== undefined) ingredient.changePac(dto.pac)
    if (dto.pod !== undefined) ingredient.changePod(dto.pod)
    if (dto.totalSolids !== undefined)
      ingredient.changeTotalSolids(dto.totalSolids)
    if (dto.ashContent !== undefined)
      ingredient.changeAshContent(dto.ashContent)

    const saved = await this.service.save(ingredient, request.context)
    return IngredientResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, Ingredient_TE)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, Ingredient_TE)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<IngredientResponseDto> {
    const ingredient = await this.service.activate(id, request.context)
    return IngredientResponseDto.fromDomain(ingredient)
  }

  @Post(':id/lock')
  @Authorize(Action.Update, Ingredient_TE)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<IngredientResponseDto> {
    const ingredient = await this.service.lock(id, request.context)
    return IngredientResponseDto.fromDomain(ingredient)
  }

  @Post(':id/unlock')
  @Authorize(Action.Unlock, Ingredient_TE)
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<IngredientResponseDto> {
    const ingredient = await this.service.unlock(id, request.context)
    return IngredientResponseDto.fromDomain(ingredient)
  }

  @Post(':id/save')
  @Authorize(Action.Update, Ingredient_TE)
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
