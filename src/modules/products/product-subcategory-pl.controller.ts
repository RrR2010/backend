import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Patch,
  ParseUUIDPipe,
  Req,
  Query
} from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import {
  CreateProductSubcategory_PLDto,
  CreateProductSubcategory_PLResponseDto,
  ProductSubcategory_PLResponseDto,
  UpdateProductSubcategory_PLDto
} from '@products/product-subcategory-pl.dto'
import { ProductSubcategory_PLService } from '@products/product-subcategory-pl.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { ProductSubcategory_PL } from '@products/product-subcategory-pl.entity'

@ApiTags('Product Subcategories PL')
@ApiBearerAuth('accessToken')
@Controller('product-subcategories-pl')
export class ProductSubcategory_PLController {
  constructor(private readonly service: ProductSubcategory_PLService) {}

  @Post()
  @Authorize(Action.Manage, ProductSubcategory_PL)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateProductSubcategory_PLDto,
    @Req() request: Request
  ): Promise<CreateProductSubcategory_PLResponseDto> {
    const subcategory = await this.service.create(
      {
        categoryId: dto.categoryId,
        code: dto.code,
        name: dto.name,
        sequentialNumber: dto.sequentialNumber
      },
      request.context
    )
    return CreateProductSubcategory_PLResponseDto.fromDomain(subcategory)
  }

  @Get()
  @Authorize(Action.Manage, ProductSubcategory_PL)
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  async findAll(
    @Req() request: Request,
    @Query('categoryId') categoryId?: string
  ): Promise<ProductSubcategory_PLResponseDto[]> {
    let subcategories: ProductSubcategory_PL[]
    if (categoryId) {
      subcategories = await this.service.findByCategoryId(
        categoryId,
        request.context
      )
    } else {
      subcategories = await this.service.findAll(request.context)
    }
    return subcategories.map((s) =>
      ProductSubcategory_PLResponseDto.fromDomain(s)
    )
  }

  @Get(':id')
  @Authorize(Action.Manage, ProductSubcategory_PL)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<ProductSubcategory_PLResponseDto> {
    const subcategory = await this.service.findById(id, request.context)
    return ProductSubcategory_PLResponseDto.fromDomain(subcategory)
  }

  @Patch(':id')
  @Authorize(Action.Manage, ProductSubcategory_PL)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductSubcategory_PLDto,
    @Req() request: Request
  ): Promise<ProductSubcategory_PLResponseDto> {
    const subcategory = await this.service.findById(id, request.context)

    if (dto.categoryId) subcategory.changeCategoryId(dto.categoryId)
    if (dto.code) subcategory.changeCode(dto.code)
    if (dto.name) subcategory.changeName(dto.name)
    if (dto.sequentialNumber !== undefined)
      subcategory.changeSequentialNumber(dto.sequentialNumber)

    const saved = await this.service.save(subcategory, request.context)
    return ProductSubcategory_PLResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Manage, ProductSubcategory_PL)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Manage, ProductSubcategory_PL)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<ProductSubcategory_PLResponseDto> {
    const subcategory = await this.service.activate(id, request.context)
    return ProductSubcategory_PLResponseDto.fromDomain(subcategory)
  }

  @Post(':id/lock')
  @Authorize(Action.Manage, ProductSubcategory_PL)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<ProductSubcategory_PLResponseDto> {
    const subcategory = await this.service.lock(id, request.context)
    return ProductSubcategory_PLResponseDto.fromDomain(subcategory)
  }

  @Post(':id/unlock')
  @Authorize(Action.Manage, ProductSubcategory_PL)
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<ProductSubcategory_PLResponseDto> {
    const subcategory = await this.service.unlock(id, request.context)
    return ProductSubcategory_PLResponseDto.fromDomain(subcategory)
  }
}
