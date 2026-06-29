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
  CreateProductLabelField_TEDto,
  ProductLabelField_TE_ResponseDto,
  UpdateProductLabelField_TEDto
} from '@products/product-label-field-te.dto'
import { ProductLabelField_TEService } from '@products/product-label-field-te.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { ProductLabelField_TE } from '@products/product-label-field-te.entity'

@ApiTags('Product Label Fields')
@ApiBearerAuth('accessToken')
@Controller('product-label-fields')
export class ProductLabelField_TEController {
  constructor(private readonly service: ProductLabelField_TEService) {}

  @Post()
  @Authorize(Action.Create, ProductLabelField_TE)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateProductLabelField_TEDto,
    @Req() request: Request
  ): Promise<ProductLabelField_TE_ResponseDto> {
    const entity = await this.service.create(
      {
        tenantId: dto.tenantId,
        productId: dto.productId,
        labelFieldId: dto.labelFieldId,
        designerValue: dto.designerValue ?? null,
        gerencialValue: dto.gerencialValue ?? null
      },
      request.context
    )
    return ProductLabelField_TE_ResponseDto.fromDomain(entity)
  }

  @Get()
  @Authorize(Action.Read, ProductLabelField_TE)
  async findAll(
    @Req() request: Request
  ): Promise<ProductLabelField_TE_ResponseDto[]> {
    const entities = await this.service.findAll({}, request.context)
    return entities.map(ProductLabelField_TE_ResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, ProductLabelField_TE)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<ProductLabelField_TE_ResponseDto> {
    const entity = await this.service.findById(id, request.context)
    return ProductLabelField_TE_ResponseDto.fromDomain(entity)
  }

  @Get('by-product/:productId')
  @Authorize(Action.Read, ProductLabelField_TE)
  async findByProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Req() request: Request
  ): Promise<ProductLabelField_TE_ResponseDto[]> {
    const entities = await this.service.findByProduct(productId, request.context)
    return entities.map(ProductLabelField_TE_ResponseDto.fromDomain)
  }

  @Patch(':id')
  @Authorize(Action.Update, ProductLabelField_TE)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductLabelField_TEDto,
    @Req() request: Request
  ): Promise<ProductLabelField_TE_ResponseDto> {
    const entity = await this.service.findById(id, request.context)

    if (dto.designerValue !== undefined) entity.changeDesignerValue(dto.designerValue)
    if (dto.gerencialValue !== undefined) entity.changeGerencialValue(dto.gerencialValue)

    const saved = await this.service.save(entity, request.context)
    return ProductLabelField_TE_ResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, ProductLabelField_TE)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }
}
