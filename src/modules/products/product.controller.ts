import { Controller, Get, Post, Patch, Delete, Body, Param, Req, ParseUUIDPipe, Query } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { Product_TE } from '@products/product.entity'
import { ProductService } from '@products/product.service'
import { CreateProduct_TEDto, UpdateProduct_TEDto, Product_TE_ResponseDto } from '@products/product.dto'
import type { Request } from 'express'

@ApiTags('Products')
@ApiBearerAuth('accessToken')
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductService) {}

  @Post()
  @Authorize(Action.Create, Product_TE)
  @ApiConsumes('application/json')
  async create(@Body() dto: CreateProduct_TEDto, @Req() request: Request): Promise<Product_TE_ResponseDto> {
    const product = await this.service.create(dto, request.context)
    return Product_TE_ResponseDto.fromDomain(product)
  }

  @Get()
  @Authorize(Action.Read, Product_TE)
  async findAll(
    @Req() request: Request,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ): Promise<Product_TE_ResponseDto[]> {
    const take = limit ? Math.min(parseInt(limit, 10), 500) : 100
    const skip = offset ? parseInt(offset, 10) : 0
    const products = await this.service.findAll({ skip, take }, request.context)
    return products.map(Product_TE_ResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, Product_TE)
  async findById(@Param('id', ParseUUIDPipe) id: string, @Req() request: Request): Promise<Product_TE_ResponseDto> {
    const product = await this.service.findById(id, request.context)
    return Product_TE_ResponseDto.fromDomain(product)
  }

  @Patch(':id')
  @Authorize(Action.Update, Product_TE)
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProduct_TEDto, @Req() request: Request): Promise<Product_TE_ResponseDto> {
    const product = await this.service.update(id, dto, request.context)
    return Product_TE_ResponseDto.fromDomain(product)
  }

  @Delete(':id')
  @Authorize(Action.Delete, Product_TE)
  async delete(@Param('id', ParseUUIDPipe) id: string, @Req() request: Request): Promise<void> {
    await this.service.delete(id, request.context)
  }
}
