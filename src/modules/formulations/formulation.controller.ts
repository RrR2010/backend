import { Controller, Get, Post, Delete, Body, Param, Req, ParseUUIDPipe } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { FormulationVersion } from '@formulations/formulation-version.entity'
import { FormulationRevision } from '@formulations/formulation-revision.entity'
import { FormulationItem } from '@formulations/formulation-item.entity'
import { FormulationService } from '@formulations/formulation.service'
import {
  CreateFormulationVersionDto, CreateFormulationRevisionDto, CreateFormulationItemDto,
  FormulationVersionResponseDto, FormulationRevisionResponseDto, FormulationItemResponseDto,
} from '@formulations/formulation.dto'
import type { Request } from 'express'

@ApiTags('Formulations')
@ApiBearerAuth('accessToken')
@Controller('formulations')
export class FormulationsController {
  constructor(private readonly service: FormulationService) {}

  // --- Versions ---

  @Post('versions')
  @Authorize(Action.Create, FormulationVersion)
  @ApiConsumes('application/json')
  async createVersion(@Body() dto: CreateFormulationVersionDto, @Req() request: Request): Promise<FormulationVersionResponseDto> {
    const v = await this.service.createVersion(dto, request.context)
    return FormulationVersionResponseDto.fromDomain(v)
  }

  @Get('versions')
  @Authorize(Action.Read, FormulationVersion)
  async findAllVersions(@Req() request: Request): Promise<FormulationVersionResponseDto[]> {
    const versions = await this.service.findAllVersions(request.context)
    return versions.map(FormulationVersionResponseDto.fromDomain)
  }

  @Get('products/:productId/versions')
  @Authorize(Action.Read, FormulationVersion)
  async findVersionsByProduct(@Param('productId', ParseUUIDPipe) productId: string, @Req() request: Request): Promise<FormulationVersionResponseDto[]> {
    const versions = await this.service.findVersionsByProduct(productId, request.context)
    return versions.map(FormulationVersionResponseDto.fromDomain)
  }

  @Get('versions/:id')
  @Authorize(Action.Read, FormulationVersion)
  async findVersionById(@Param('id', ParseUUIDPipe) id: string, @Req() request: Request): Promise<FormulationVersionResponseDto> {
    const v = await this.service.findVersionById(id, request.context)
    return FormulationVersionResponseDto.fromDomain(v)
  }

  @Delete('versions/:id')
  @Authorize(Action.Delete, FormulationVersion)
  async deleteVersion(@Param('id', ParseUUIDPipe) id: string, @Req() request: Request): Promise<void> {
    await this.service.deleteVersion(id, request.context)
  }

  // --- Revisions ---

  @Post('revisions')
  @Authorize(Action.Create, FormulationRevision)
  @ApiConsumes('application/json')
  async createRevision(@Body() dto: CreateFormulationRevisionDto, @Req() request: Request): Promise<FormulationRevisionResponseDto> {
    const r = await this.service.createRevision(dto, request.context)
    return FormulationRevisionResponseDto.fromDomain(r)
  }

  @Get('versions/:versionId/revisions')
  @Authorize(Action.Read, FormulationRevision)
  async findRevisionsByVersion(@Param('versionId', ParseUUIDPipe) versionId: string, @Req() request: Request): Promise<FormulationRevisionResponseDto[]> {
    const revisions = await this.service.findRevisionsByVersion(versionId, request.context)
    return revisions.map(FormulationRevisionResponseDto.fromDomain)
  }

  @Get('revisions/:id')
  @Authorize(Action.Read, FormulationRevision)
  async findRevisionById(@Param('id', ParseUUIDPipe) id: string, @Req() request: Request): Promise<FormulationRevisionResponseDto> {
    const r = await this.service.findRevisionById(id, request.context)
    return FormulationRevisionResponseDto.fromDomain(r)
  }

  // --- Items ---

  @Post('items')
  @Authorize(Action.Create, FormulationItem)
  @ApiConsumes('application/json')
  async createItem(@Body() dto: CreateFormulationItemDto, @Req() request: Request): Promise<FormulationItemResponseDto> {
    const i = await this.service.createItem(dto, request.context)
    return FormulationItemResponseDto.fromDomain(i)
  }

  @Get('items/:revisionId')
  @Authorize(Action.Read, FormulationItem)
  async findItemsByRevision(@Param('revisionId', ParseUUIDPipe) revisionId: string, @Req() request: Request): Promise<FormulationItemResponseDto[]> {
    const items = await this.service.findItemsByRevision(revisionId, request.context)
    return items.map(FormulationItemResponseDto.fromDomain)
  }

  @Delete('items/:id')
  @Authorize(Action.Delete, FormulationItem)
  async deleteItem(@Param('id', ParseUUIDPipe) id: string, @Req() request: Request): Promise<void> {
    await this.service.deleteItem(id, request.context)
  }
}
