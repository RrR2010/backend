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
  CreateProductCategory_PLDto,
  CreateProductCategory_PLResponseDto,
  ProductCategory_PLResponseDto,
  UpdateProductCategory_PLDto
} from '@products/product-category-pl.dto'
import { ProductCategory_PLService } from '@products/product-category-pl.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { ProductCategory_PL } from '@products/product-category-pl.entity'

@ApiTags('Product Categories PL')
@ApiBearerAuth('accessToken')
@Controller('product-categories-pl')
export class ProductCategory_PLController {
  constructor(private readonly service: ProductCategory_PLService) {}

  @Post()
  @Authorize(Action.Manage, ProductCategory_PL)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateProductCategory_PLDto,
    @Req() request: Request
  ): Promise<CreateProductCategory_PLResponseDto> {
    const category = await this.service.create(
      {
        code: dto.code,
        name: dto.name,
        description: dto.description ?? null,
        sequentialNumber: dto.sequentialNumber
      },
      request.context
    )
    return CreateProductCategory_PLResponseDto.fromDomain(category)
  }

  @Get()
  @Authorize(Action.Manage, ProductCategory_PL)
  async findAll(
    @Req() request: Request
  ): Promise<ProductCategory_PLResponseDto[]> {
    const categories = await this.service.findAll(request.context)
    return categories.map((c) => ProductCategory_PLResponseDto.fromDomain(c))
  }

  @Get(':id')
  @Authorize(Action.Manage, ProductCategory_PL)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<ProductCategory_PLResponseDto> {
    const category = await this.service.findById(id, request.context)
    return ProductCategory_PLResponseDto.fromDomain(category)
  }

  @Patch(':id')
  @Authorize(Action.Manage, ProductCategory_PL)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductCategory_PLDto,
    @Req() request: Request
  ): Promise<ProductCategory_PLResponseDto> {
    const category = await this.service.findById(id, request.context)

    if (dto.code) category.changeCode(dto.code)
    if (dto.name) category.changeName(dto.name)
    if (dto.description !== undefined)
      category.changeDescription(dto.description)
    if (dto.sequentialNumber !== undefined)
      category.changeSequentialNumber(dto.sequentialNumber)

    const saved = await this.service.save(category, request.context)
    return ProductCategory_PLResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Manage, ProductCategory_PL)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Manage, ProductCategory_PL)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<ProductCategory_PLResponseDto> {
    const category = await this.service.activate(id, request.context)
    return ProductCategory_PLResponseDto.fromDomain(category)
  }

  @Post(':id/lock')
  @Authorize(Action.Manage, ProductCategory_PL)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<ProductCategory_PLResponseDto> {
    const category = await this.service.lock(id, request.context)
    return ProductCategory_PLResponseDto.fromDomain(category)
  }

  @Post(':id/unlock')
  @Authorize(Action.Manage, ProductCategory_PL)
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<ProductCategory_PLResponseDto> {
    const category = await this.service.unlock(id, request.context)
    return ProductCategory_PLResponseDto.fromDomain(category)
  }
}
