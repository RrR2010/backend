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
  CreateProductPanel_TEDto,
  ProductPanel_TE_ResponseDto,
  UpdateProductPanel_TEDto
} from '@products/product-panel-te.dto'
import { ProductPanel_TEService } from '@products/product-panel-te.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { ProductPanel_TE } from '@products/product-panel-te.entity'

@ApiTags('Product Panels')
@ApiBearerAuth('accessToken')
@Controller('product-panels')
export class ProductPanel_TEController {
  constructor(private readonly service: ProductPanel_TEService) {}

  @Post()
  @Authorize(Action.Create, ProductPanel_TE)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateProductPanel_TEDto,
    @Req() request: Request
  ): Promise<ProductPanel_TE_ResponseDto> {
    const entity = await this.service.create(
      {
        productId: dto.productId,
        panelNumber: dto.panelNumber,
        type: dto.type,
        geometricFormatTypeId: dto.geometricFormatTypeId ?? null,
        geometricFormatValues: dto.geometricFormatValues ?? null
      },
      request.context
    )
    return ProductPanel_TE_ResponseDto.fromDomain(entity)
  }

  @Get()
  @Authorize(Action.Read, ProductPanel_TE)
  async findAll(
    @Req() request: Request
  ): Promise<ProductPanel_TE_ResponseDto[]> {
    const entities = await this.service.findAll({}, request.context)
    return entities.map(ProductPanel_TE_ResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, ProductPanel_TE)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<ProductPanel_TE_ResponseDto> {
    const entity = await this.service.findById(id, request.context)
    return ProductPanel_TE_ResponseDto.fromDomain(entity)
  }

  @Get('by-product/:productId')
  @Authorize(Action.Read, ProductPanel_TE)
  async findByProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Req() request: Request
  ): Promise<ProductPanel_TE_ResponseDto[]> {
    const entities = await this.service.findByProduct(productId, request.context)
    return entities.map(ProductPanel_TE_ResponseDto.fromDomain)
  }

  @Patch(':id')
  @Authorize(Action.Update, ProductPanel_TE)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductPanel_TEDto,
    @Req() request: Request
  ): Promise<ProductPanel_TE_ResponseDto> {
    const entity = await this.service.findById(id, request.context)

    if (dto.panelNumber !== undefined) entity.changePanelNumber(dto.panelNumber)
    if (dto.type !== undefined) entity.changeType(dto.type)
    if (dto.geometricFormatTypeId !== undefined)
      entity.changeGeometricFormatTypeId(dto.geometricFormatTypeId)
    if (dto.geometricFormatValues !== undefined)
      entity.changeGeometricFormatValues(dto.geometricFormatValues)

    const saved = await this.service.save(entity, request.context)
    return ProductPanel_TE_ResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, ProductPanel_TE)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, ProductPanel_TE)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<ProductPanel_TE_ResponseDto> {
    const entity = await this.service.activate(id, request.context)
    return ProductPanel_TE_ResponseDto.fromDomain(entity)
  }

  @Post(':id/lock')
  @Authorize(Action.Update, ProductPanel_TE)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<ProductPanel_TE_ResponseDto> {
    const entity = await this.service.lock(id, request.context)
    return ProductPanel_TE_ResponseDto.fromDomain(entity)
  }

  @Post(':id/unlock')
  @Authorize(Action.Unlock, ProductPanel_TE)
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<ProductPanel_TE_ResponseDto> {
    const entity = await this.service.unlock(id, request.context)
    return ProductPanel_TE_ResponseDto.fromDomain(entity)
  }
}
