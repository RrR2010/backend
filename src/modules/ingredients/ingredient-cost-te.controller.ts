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
  CreateIngredientCost_TEDto,
  CreateIngredientCost_TE_ResponseDto,
  IngredientCost_TE_ResponseDto,
  UpdateIngredientCost_TEDto
} from '@ingredients/ingredient-cost-te.dto'
import { IngredientCost_TEService } from '@ingredients/ingredient-cost-te.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { IngredientCost_TE } from '@ingredients/ingredient-cost-te.entity'

@ApiTags('IngredientCosts')
@ApiBearerAuth('accessToken')
@Controller('ingredient-costs')
export class IngredientCost_TEController {
  constructor(private readonly service: IngredientCost_TEService) {}

  @Post()
  @Authorize(Action.Create, IngredientCost_TE)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateIngredientCost_TEDto,
    @Req() request: Request
  ): Promise<CreateIngredientCost_TE_ResponseDto> {
    const entity = await this.service.create(
      {
        tenantId: dto.tenantId ?? '',
        ingredientId: dto.ingredientId,
        unitPrice: dto.unitPrice,
        currencyCode: dto.currencyCode,
        unitOfMeasureId: dto.unitOfMeasureId,
        effectiveDate: dto.effectiveDate,
        supplierId: dto.supplierId ?? null,
        notes: dto.notes ?? null
      },
      request.context
    )
    return CreateIngredientCost_TE_ResponseDto.fromDomain(entity)
  }

  @Get()
  @Authorize(Action.Read, IngredientCost_TE)
  async findAll(@Req() request: Request): Promise<IngredientCost_TE_ResponseDto[]> {
    const entities = await this.service.findAll({}, request.context)
    return entities.map(IngredientCost_TE_ResponseDto.fromDomain)
  }

  @Get('by-ingredient/:ingredientId')
  @Authorize(Action.Read, IngredientCost_TE)
  async findByIngredientId(
    @Param('ingredientId', ParseUUIDPipe) ingredientId: string,
    @Req() request: Request
  ): Promise<IngredientCost_TE_ResponseDto[]> {
    const entities = await this.service.findByIngredientId(
      ingredientId,
      request.context
    )
    return entities.map(IngredientCost_TE_ResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, IngredientCost_TE)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<IngredientCost_TE_ResponseDto> {
    const entity = await this.service.findById(id, request.context)
    return IngredientCost_TE_ResponseDto.fromDomain(entity)
  }

  @Patch(':id')
  @Authorize(Action.Update, IngredientCost_TE)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIngredientCost_TEDto,
    @Req() request: Request
  ): Promise<IngredientCost_TE_ResponseDto> {
    const entity = await this.service.findById(id, request.context)

    if (dto.unitPrice !== undefined) entity.changeUnitPrice(dto.unitPrice)
    if (dto.currencyCode !== undefined) entity.changeCurrencyCode(dto.currencyCode)
    if (dto.unitOfMeasureId !== undefined)
      entity.changeUnitOfMeasureId(dto.unitOfMeasureId)
    if (dto.effectiveDate !== undefined)
      entity.changeEffectiveDate(dto.effectiveDate)
    if (dto.supplierId !== undefined)
      entity.changeSupplierId(dto.supplierId)
    if (dto.notes !== undefined) entity.changeNotes(dto.notes)

    const saved = await this.service.save(entity, request.context)
    return IngredientCost_TE_ResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, IngredientCost_TE)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, IngredientCost_TE)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<IngredientCost_TE_ResponseDto> {
    const entity = await this.service.activate(id, request.context)
    return IngredientCost_TE_ResponseDto.fromDomain(entity)
  }

  @Post(':id/lock')
  @Authorize(Action.Update, IngredientCost_TE)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<IngredientCost_TE_ResponseDto> {
    const entity = await this.service.lock(id, request.context)
    return IngredientCost_TE_ResponseDto.fromDomain(entity)
  }

  @Post(':id/unlock')
  @Authorize(Action.Unlock, IngredientCost_TE)
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<IngredientCost_TE_ResponseDto> {
    const entity = await this.service.unlock(id, request.context)
    return IngredientCost_TE_ResponseDto.fromDomain(entity)
  }
}
