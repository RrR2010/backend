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
  CreateProductFamily_TEDto,
  CreateProductFamily_TEDtoResponseDto,
  ProductFamily_TEDtoResponseDto,
  UpdateProductFamily_TEDto
} from '@products/product-family-te.dto'
import { ProductFamily_TEService } from '@products/product-family-te.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { ProductFamily_TE } from '@products/product-family-te.entity'

@ApiTags('ProductFamilies')
@ApiBearerAuth('accessToken')
@Controller('product-families')
export class ProductFamiliesController {
  constructor(private readonly service: ProductFamily_TEService) {}

  @Post()
  @Authorize(Action.Create, ProductFamily_TE)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateProductFamily_TEDto,
    @Req() request: Request
  ): Promise<CreateProductFamily_TEDtoResponseDto> {
    const family = await this.service.create(
      {
        tenantId: dto.tenantId,
        name: dto.name,
        description: dto.description ?? null
      },
      request.context
    )
    return CreateProductFamily_TEDtoResponseDto.fromDomain(family)
  }

  @Get()
  @Authorize(Action.Read, ProductFamily_TE)
  async findAll(
    @Req() request: Request
  ): Promise<ProductFamily_TEDtoResponseDto[]> {
    const families = await this.service.findAll({}, request.context)
    return families.map(ProductFamily_TEDtoResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, ProductFamily_TE)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<ProductFamily_TEDtoResponseDto> {
    const family = await this.service.findById(id, request.context)
    return ProductFamily_TEDtoResponseDto.fromDomain(family)
  }

  @Patch(':id')
  @Authorize(Action.Update, ProductFamily_TE)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductFamily_TEDto,
    @Req() request: Request
  ): Promise<ProductFamily_TEDtoResponseDto> {
    const family = await this.service.findById(id, request.context)

    if (dto.name !== undefined) family.changeName(dto.name)
    if (dto.description !== undefined) family.changeDescription(dto.description)

    const saved = await this.service.save(family, request.context)
    return ProductFamily_TEDtoResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, ProductFamily_TE)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, ProductFamily_TE)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<ProductFamily_TEDtoResponseDto> {
    const entity = await this.service.activate(id, request.context)
    return ProductFamily_TEDtoResponseDto.fromDomain(entity)
  }

  @Post(':id/lock')
  @Authorize(Action.Update, ProductFamily_TE)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<ProductFamily_TEDtoResponseDto> {
    const entity = await this.service.lock(id, request.context)
    return ProductFamily_TEDtoResponseDto.fromDomain(entity)
  }

  @Post(':id/unlock')
  @Authorize(Action.Unlock, ProductFamily_TE)
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<ProductFamily_TEDtoResponseDto> {
    const entity = await this.service.unlock(id, request.context)
    return ProductFamily_TEDtoResponseDto.fromDomain(entity)
  }
}
