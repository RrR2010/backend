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
  CreateProductClaim_TEDto,
  ProductClaim_TE_ResponseDto,
  UpdateProductClaim_TEDto
} from '@products/product-claim-te.dto'
import { ProductClaim_TEService } from '@products/product-claim-te.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { ProductClaim_TE } from '@products/product-claim-te.entity'

@ApiTags('Product Claims')
@ApiBearerAuth('accessToken')
@Controller('product-claims')
export class ProductClaim_TEController {
  constructor(private readonly service: ProductClaim_TEService) {}

  @Post()
  @Authorize(Action.Create, ProductClaim_TE)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateProductClaim_TEDto,
    @Req() request: Request
  ): Promise<ProductClaim_TE_ResponseDto> {
    const entity = await this.service.create(
      {
        tenantId: dto.tenantId,
        productId: dto.productId,
        claimId: dto.claimId,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0
      },
      request.context
    )
    return ProductClaim_TE_ResponseDto.fromDomain(entity)
  }

  @Get()
  @Authorize(Action.Read, ProductClaim_TE)
  async findAll(
    @Req() request: Request
  ): Promise<ProductClaim_TE_ResponseDto[]> {
    const entities = await this.service.findAll({}, request.context)
    return entities.map(ProductClaim_TE_ResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, ProductClaim_TE)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<ProductClaim_TE_ResponseDto> {
    const entity = await this.service.findById(id, request.context)
    return ProductClaim_TE_ResponseDto.fromDomain(entity)
  }

  @Get('by-product/:productId')
  @Authorize(Action.Read, ProductClaim_TE)
  async findByProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Req() request: Request
  ): Promise<ProductClaim_TE_ResponseDto[]> {
    const entities = await this.service.findByProduct(productId, request.context)
    return entities.map(ProductClaim_TE_ResponseDto.fromDomain)
  }

  @Patch(':id')
  @Authorize(Action.Update, ProductClaim_TE)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductClaim_TEDto,
    @Req() request: Request
  ): Promise<ProductClaim_TE_ResponseDto> {
    const entity = await this.service.findById(id, request.context)

    if (dto.isActive !== undefined) entity.changeIsActive(dto.isActive)
    if (dto.sortOrder !== undefined) entity.changeSortOrder(dto.sortOrder)

    const saved = await this.service.save(entity, request.context)
    return ProductClaim_TE_ResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, ProductClaim_TE)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, ProductClaim_TE)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<ProductClaim_TE_ResponseDto> {
    const entity = await this.service.activate(id, request.context)
    return ProductClaim_TE_ResponseDto.fromDomain(entity)
  }

  @Post(':id/lock')
  @Authorize(Action.Update, ProductClaim_TE)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<ProductClaim_TE_ResponseDto> {
    const entity = await this.service.lock(id, request.context)
    return ProductClaim_TE_ResponseDto.fromDomain(entity)
  }

  @Post(':id/unlock')
  @Authorize(Action.Unlock, ProductClaim_TE)
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<ProductClaim_TE_ResponseDto> {
    const entity = await this.service.unlock(id, request.context)
    return ProductClaim_TE_ResponseDto.fromDomain(entity)
  }
}
