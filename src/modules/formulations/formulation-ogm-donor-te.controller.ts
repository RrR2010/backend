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
  CreateFormulationOgmDonor_TEDto,
  CreateFormulationOgmDonor_TE_ResponseDto,
  FormulationOgmDonor_TE_ResponseDto,
  UpdateFormulationOgmDonor_TEDto
} from './formulation-ogm-donor-te.dto'
import { FormulationOgmDonor_TEService } from './formulation-ogm-donor-te.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { FormulationOgmDonor_TE } from './formulation-ogm-donor-te.entity'

@ApiTags('Formulation OGM Donors (TE)')
@ApiBearerAuth('accessToken')
@Controller('formulation-ogm-donors')
export class FormulationOgmDonor_TEController {
  constructor(private readonly service: FormulationOgmDonor_TEService) {}

  @Post()
  @Authorize(Action.Manage, FormulationOgmDonor_TE)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateFormulationOgmDonor_TEDto,
    @Req() request: Request
  ): Promise<CreateFormulationOgmDonor_TE_ResponseDto> {
    const tenantId = getEffectiveTenantId(request.context)
    if (!tenantId) throw new InternalServerErrorException('tenantId is required')
    const entry = await this.service.create(
      {
        tenantId,
        formulationRevisionId: dto.formulationRevisionId,
        ogmDonorSpeciesId: dto.ogmDonorSpeciesId
      },
      request.context
    )
    return CreateFormulationOgmDonor_TE_ResponseDto.fromDomain(entry)
  }

  @Get()
  @Authorize(Action.Read, FormulationOgmDonor_TE)
  async findAll(
    @Req() request: Request
  ): Promise<FormulationOgmDonor_TE_ResponseDto[]> {
    const entries = await this.service.findAll({}, request.context)
    return entries.map(FormulationOgmDonor_TE_ResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, FormulationOgmDonor_TE)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<FormulationOgmDonor_TE_ResponseDto> {
    const entry = await this.service.findById(id, request.context)
    return FormulationOgmDonor_TE_ResponseDto.fromDomain(entry)
  }

  @Get('by-revision/:revisionId')
  @Authorize(Action.Read, FormulationOgmDonor_TE)
  async findByRevision(
    @Param('revisionId', ParseUUIDPipe) revisionId: string,
    @Req() request: Request
  ): Promise<FormulationOgmDonor_TE_ResponseDto[]> {
    const entries = await this.service.findByRevisionId(
      revisionId,
      request.context
    )
    return entries.map(FormulationOgmDonor_TE_ResponseDto.fromDomain)
  }

  @Patch(':id')
  @Authorize(Action.Manage, FormulationOgmDonor_TE)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFormulationOgmDonor_TEDto,
    @Req() request: Request
  ): Promise<FormulationOgmDonor_TE_ResponseDto> {
    const entry = await this.service.findById(id, request.context)

    if (dto.ogmDonorSpeciesId !== undefined)
      entry.changeOgmDonorSpeciesId(dto.ogmDonorSpeciesId)

    const saved = await this.service.save(entry, request.context)
    return FormulationOgmDonor_TE_ResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Manage, FormulationOgmDonor_TE)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }
}
