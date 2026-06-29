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
import { InternalServerErrorException } from '@nestjs/common'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'
import {
  CreateFormulationRegulatoryDeclaration_TEDto,
  CreateFormulationRegulatoryDeclaration_TE_ResponseDto,
  FormulationRegulatoryDeclaration_TE_ResponseDto,
  UpdateFormulationRegulatoryDeclaration_TEDto
} from './formulation-regulatory-declaration-te.dto'
import { FormulationRegulatoryDeclaration_TEService } from './formulation-regulatory-declaration-te.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { FormulationRegulatoryDeclaration_TE } from './formulation-regulatory-declaration-te.entity'

@ApiTags('Formulation Regulatory Declarations (TE)')
@ApiBearerAuth('accessToken')
@Controller('formulation-regulatory-declarations')
export class FormulationRegulatoryDeclaration_TEController {
  constructor(
    private readonly service: FormulationRegulatoryDeclaration_TEService
  ) {}

  @Post()
  @Authorize(Action.Manage, FormulationRegulatoryDeclaration_TE)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateFormulationRegulatoryDeclaration_TEDto,
    @Req() request: Request
  ): Promise<CreateFormulationRegulatoryDeclaration_TE_ResponseDto> {
    const tenantId = getEffectiveTenantId(request.context)
    if (!tenantId) throw new InternalServerErrorException('tenantId is required')
    const entry = await this.service.create(
      {
        tenantId,
        formulationRevisionId: dto.formulationRevisionId,
        flagId: dto.flagId,
        flagValue: dto.flagValue,
        notes: dto.notes ?? null
      },
      request.context
    )
    return CreateFormulationRegulatoryDeclaration_TE_ResponseDto.fromDomain(
      entry
    )
  }

  @Get()
  @Authorize(Action.Read, FormulationRegulatoryDeclaration_TE)
  async findAll(
    @Req() request: Request
  ): Promise<FormulationRegulatoryDeclaration_TE_ResponseDto[]> {
    const entries = await this.service.findAll({}, request.context)
    return entries.map(
      FormulationRegulatoryDeclaration_TE_ResponseDto.fromDomain
    )
  }

  @Get(':id')
  @Authorize(Action.Read, FormulationRegulatoryDeclaration_TE)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<FormulationRegulatoryDeclaration_TE_ResponseDto> {
    const entry = await this.service.findById(id, request.context)
    return FormulationRegulatoryDeclaration_TE_ResponseDto.fromDomain(entry)
  }

  @Get('by-revision/:revisionId')
  @Authorize(Action.Read, FormulationRegulatoryDeclaration_TE)
  async findByRevision(
    @Param('revisionId', ParseUUIDPipe) revisionId: string,
    @Req() request: Request
  ): Promise<FormulationRegulatoryDeclaration_TE_ResponseDto[]> {
    const entries = await this.service.findByRevisionId(
      revisionId,
      request.context
    )
    return entries.map(
      FormulationRegulatoryDeclaration_TE_ResponseDto.fromDomain
    )
  }

  @Patch(':id')
  @Authorize(Action.Manage, FormulationRegulatoryDeclaration_TE)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFormulationRegulatoryDeclaration_TEDto,
    @Req() request: Request
  ): Promise<FormulationRegulatoryDeclaration_TE_ResponseDto> {
    const entry = await this.service.findById(id, request.context)

    if (dto.flagValue !== undefined) entry.changeFlagValue(dto.flagValue)
    if (dto.notes !== undefined) entry.changeNotes(dto.notes)

    const saved = await this.service.save(entry, request.context)
    return FormulationRegulatoryDeclaration_TE_ResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Manage, FormulationRegulatoryDeclaration_TE)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }
}
