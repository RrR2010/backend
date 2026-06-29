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
  CreateProductNutrientOverride_TEDto,
  ProductNutrientOverride_TE_ResponseDto,
  UpdateProductNutrientOverride_TEDto
} from '@products/product-nutrient-override-te.dto'
import { ProductNutrientOverride_TEService } from '@products/product-nutrient-override-te.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { ProductNutrientOverride_TE } from '@products/product-nutrient-override-te.entity'

@ApiTags('Product Nutrient Overrides')
@ApiBearerAuth('accessToken')
@Controller('product-nutrient-overrides')
export class ProductNutrientOverride_TEController {
  constructor(
    private readonly service: ProductNutrientOverride_TEService
  ) {}

  @Post()
  @Authorize(Action.Create, ProductNutrientOverride_TE)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateProductNutrientOverride_TEDto,
    @Req() request: Request
  ): Promise<ProductNutrientOverride_TE_ResponseDto> {
    const entity = await this.service.create(
      {
        productId: dto.productId,
        nutrientId: dto.nutrientId,
        overriddenValue: dto.overriddenValue,
        notes: dto.notes ?? null
      },
      request.context
    )
    return ProductNutrientOverride_TE_ResponseDto.fromDomain(entity)
  }

  @Get()
  @Authorize(Action.Read, ProductNutrientOverride_TE)
  async findAll(
    @Req() request: Request
  ): Promise<ProductNutrientOverride_TE_ResponseDto[]> {
    const entities = await this.service.findAll({}, request.context)
    return entities.map(ProductNutrientOverride_TE_ResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, ProductNutrientOverride_TE)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<ProductNutrientOverride_TE_ResponseDto> {
    const entity = await this.service.findById(id, request.context)
    return ProductNutrientOverride_TE_ResponseDto.fromDomain(entity)
  }

  @Get('by-product/:productId')
  @Authorize(Action.Read, ProductNutrientOverride_TE)
  async findByProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Req() request: Request
  ): Promise<ProductNutrientOverride_TE_ResponseDto[]> {
    const entities = await this.service.findByProduct(
      productId,
      request.context
    )
    return entities.map(ProductNutrientOverride_TE_ResponseDto.fromDomain)
  }

  @Patch(':id')
  @Authorize(Action.Update, ProductNutrientOverride_TE)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductNutrientOverride_TEDto,
    @Req() request: Request
  ): Promise<ProductNutrientOverride_TE_ResponseDto> {
    const entity = await this.service.findById(id, request.context)

    if (dto.overriddenValue !== undefined)
      entity.changeOverriddenValue(dto.overriddenValue)
    if (dto.notes !== undefined) entity.changeNotes(dto.notes)

    const saved = await this.service.save(entity, request.context)
    return ProductNutrientOverride_TE_ResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, ProductNutrientOverride_TE)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }
}
