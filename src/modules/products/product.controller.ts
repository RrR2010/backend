import { Controller, Get, Post, Patch, Delete, Body, Param, Req, ParseUUIDPipe } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { Product } from '@products/product.entity'
import { ProductService } from '@products/product.service'
import { CreateProductDto, UpdateProductDto, ProductResponseDto } from '@products/product.dto'
import type { Request } from 'express'

@ApiTags('Products')
@ApiBearerAuth('accessToken')
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductService) {}

  @Post()
  @Authorize(Action.Create, Product)
  @ApiConsumes('application/json')
  async create(@Body() dto: CreateProductDto, @Req() request: Request): Promise<ProductResponseDto> {
    const product = await this.service.create(dto, request.context)
    return ProductResponseDto.fromDomain(product)
  }

  @Get()
  @Authorize(Action.Read, Product)
  async findAll(@Req() request: Request): Promise<ProductResponseDto[]> {
    const products = await this.service.findAll({}, request.context)
    return products.map(ProductResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, Product)
  async findById(@Param('id', ParseUUIDPipe) id: string, @Req() request: Request): Promise<ProductResponseDto> {
    const product = await this.service.findById(id, request.context)
    return ProductResponseDto.fromDomain(product)
  }

  @Patch(':id')
  @Authorize(Action.Update, Product)
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto, @Req() request: Request): Promise<ProductResponseDto> {
    const product = await this.service.update(id, dto, request.context)
    return ProductResponseDto.fromDomain(product)
  }

  @Delete(':id')
  @Authorize(Action.Delete, Product)
  async delete(@Param('id', ParseUUIDPipe) id: string, @Req() request: Request): Promise<void> {
    await this.service.delete(id, request.context)
  }
}
