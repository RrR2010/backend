import { Controller, Get, Post, Delete, Body, Param, Req, ParseUUIDPipe, Query } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { FormulationVersion_TE } from '@formulations/formulation-version.entity'
import { FormulationRevision_TE } from '@formulations/formulation-revision.entity'
import { FormulationItem_TE } from '@formulations/formulation-item.entity'
import { FormulationService } from '@formulations/formulation.service'
import {
  CreateFormulationVersion_TEDto, CreateFormulationRevision_TEDto, CreateFormulationItem_TEDto,
  FormulationVersion_TE_ResponseDto, FormulationRevision_TE_ResponseDto, FormulationItem_TE_ResponseDto,
  ApproveRevisionDto,
} from '@formulations/formulation.dto'
import type { Request } from 'express'

@ApiTags('Formulations')
@ApiBearerAuth('accessToken')
@Controller('formulations')
export class FormulationsController {
  constructor(private readonly service: FormulationService) {}

  // --- Versions ---

  @Post('versions')
  @Authorize(Action.Create, FormulationVersion_TE)
  @ApiConsumes('application/json')
  async createVersion(@Body() dto: CreateFormulationVersion_TEDto, @Req() request: Request): Promise<FormulationVersion_TE_ResponseDto> {
    const version = await this.service.createVersion(dto, request.context)
    return FormulationVersion_TE_ResponseDto.fromDomain(version)
  }

  @Get('versions')
  @Authorize(Action.Read, FormulationVersion_TE)
  async findAllVersions(
    @Req() request: Request,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ): Promise<FormulationVersion_TE_ResponseDto[]> {
    const take = limit ? Math.min(parseInt(limit, 10), 500) : 100
    const skip = offset ? parseInt(offset, 10) : 0
    const versions = await this.service.findAllVersions(request.context, skip, take)
    return versions.map(FormulationVersion_TE_ResponseDto.fromDomain)
  }

  @Get('products/:productId/versions')
  @Authorize(Action.Read, FormulationVersion_TE)
  async findVersionsByProduct(@Param('productId', ParseUUIDPipe) productId: string, @Req() request: Request): Promise<FormulationVersion_TE_ResponseDto[]> {
    const versions = await this.service.findVersionsByProduct(productId, request.context)
    return versions.map(FormulationVersion_TE_ResponseDto.fromDomain)
  }

  @Get('versions/:id')
  @Authorize(Action.Read, FormulationVersion_TE)
  async findVersionById(@Param('id', ParseUUIDPipe) id: string, @Req() request: Request): Promise<FormulationVersion_TE_ResponseDto> {
    const version = await this.service.findVersionById(id, request.context)
    return FormulationVersion_TE_ResponseDto.fromDomain(version)
  }

  @Delete('versions/:id')
  @Authorize(Action.Delete, FormulationVersion_TE)
  async deleteVersion(@Param('id', ParseUUIDPipe) id: string, @Req() request: Request): Promise<void> {
    await this.service.deleteVersion(id, request.context)
  }

  // --- Revisions ---

  @Post('revisions')
  @Authorize(Action.Create, FormulationRevision_TE)
  @ApiConsumes('application/json')
  async createRevision(@Body() dto: CreateFormulationRevision_TEDto, @Req() request: Request): Promise<FormulationRevision_TE_ResponseDto> {
    const revision = await this.service.createRevision(dto, request.context)
    return FormulationRevision_TE_ResponseDto.fromDomain(revision)
  }

  @Get('versions/:versionId/revisions')
  @Authorize(Action.Read, FormulationRevision_TE)
  async findRevisionsByVersion(@Param('versionId', ParseUUIDPipe) versionId: string, @Req() request: Request): Promise<FormulationRevision_TE_ResponseDto[]> {
    const revisions = await this.service.findRevisionsByVersion(versionId, request.context)
    return revisions.map(FormulationRevision_TE_ResponseDto.fromDomain)
  }

  @Get('revisions/:id')
  @Authorize(Action.Read, FormulationRevision_TE)
  async findRevisionById(@Param('id', ParseUUIDPipe) id: string, @Req() request: Request): Promise<FormulationRevision_TE_ResponseDto> {
    const revision = await this.service.findRevisionById(id, request.context)
    return FormulationRevision_TE_ResponseDto.fromDomain(revision)
  }

  @Post('revisions/:id/submit')
  @Authorize(Action.Update, FormulationRevision_TE)
  async submitRevision(@Param('id', ParseUUIDPipe) id: string, @Req() request: Request): Promise<FormulationRevision_TE_ResponseDto> {
    const revision = await this.service.submitRevision(id, request.context)
    return FormulationRevision_TE_ResponseDto.fromDomain(revision)
  }

  @Post('revisions/:id/approve')
  @Authorize(Action.Approve, FormulationRevision_TE)
  async approveRevision(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ApproveRevisionDto, @Req() request: Request): Promise<FormulationRevision_TE_ResponseDto> {
    const revision = await this.service.approveRevision(id, dto.approverId, dto.approvedBy, request.context)
    return FormulationRevision_TE_ResponseDto.fromDomain(revision)
  }

  @Post('revisions/:id/reject')
  @Authorize(Action.Update, FormulationRevision_TE)
  async rejectRevision(@Param('id', ParseUUIDPipe) id: string, @Req() request: Request): Promise<FormulationRevision_TE_ResponseDto> {
    const revision = await this.service.rejectRevision(id, request.context)
    return FormulationRevision_TE_ResponseDto.fromDomain(revision)
  }

  @Post('revisions/:id/archive')
  @Authorize(Action.Update, FormulationRevision_TE)
  async archiveRevision(@Param('id', ParseUUIDPipe) id: string, @Req() request: Request): Promise<FormulationRevision_TE_ResponseDto> {
    const revision = await this.service.archiveRevision(id, request.context)
    return FormulationRevision_TE_ResponseDto.fromDomain(revision)
  }

  // --- Items ---

  @Post('items')
  @Authorize(Action.Create, FormulationItem_TE)
  @ApiConsumes('application/json')
  async createItem(@Body() dto: CreateFormulationItem_TEDto, @Req() request: Request): Promise<FormulationItem_TE_ResponseDto> {
    const item = await this.service.createItem(dto, request.context)
    return FormulationItem_TE_ResponseDto.fromDomain(item)
  }

  @Get('items/:revisionId')
  @Authorize(Action.Read, FormulationItem_TE)
  async findItemsByRevision(@Param('revisionId', ParseUUIDPipe) revisionId: string, @Req() request: Request): Promise<FormulationItem_TE_ResponseDto[]> {
    const items = await this.service.findItemsByRevision(revisionId, request.context)
    return items.map(FormulationItem_TE_ResponseDto.fromDomain)
  }

  @Delete('items/:id')
  @Authorize(Action.Delete, FormulationItem_TE)
  async deleteItem(@Param('id', ParseUUIDPipe) id: string, @Req() request: Request): Promise<void> {
    await this.service.deleteItem(id, request.context)
  }
}
