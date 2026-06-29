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
  CreateFormulationNutrition_TEDto,
  CreateFormulationNutrition_TE_ResponseDto,
  FormulationNutrition_TE_ResponseDto,
  UpdateFormulationNutrition_TEDto
} from './formulation-nutrition-te.dto'
import { FormulationNutrition_TEService } from './formulation-nutrition-te.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { FormulationNutrition_TE } from './formulation-nutrition-te.entity'

@ApiTags('Formulation Nutritions (TE)')
@ApiBearerAuth('accessToken')
@Controller('formulation-nutritions')
export class FormulationNutrition_TEController {
  constructor(private readonly service: FormulationNutrition_TEService) {}

  @Post()
  @Authorize(Action.Manage, FormulationNutrition_TE)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateFormulationNutrition_TEDto,
    @Req() request: Request
  ): Promise<CreateFormulationNutrition_TE_ResponseDto> {
    const tenantId = getEffectiveTenantId(request.context)
    if (!tenantId) throw new InternalServerErrorException('tenantId is required')
    const entry = await this.service.create(
      {
        tenantId,
        formulationRevisionId: dto.formulationRevisionId,
        nutrientId: dto.nutrientId,
        declaredValue: dto.declaredValue ?? null,
        calculatedValue: dto.calculatedValue ?? null,
        refValue: dto.refValue ?? null,
        notes: dto.notes ?? null
      },
      request.context
    )
    return CreateFormulationNutrition_TE_ResponseDto.fromDomain(entry)
  }

  @Get()
  @Authorize(Action.Read, FormulationNutrition_TE)
  async findAll(
    @Req() request: Request
  ): Promise<FormulationNutrition_TE_ResponseDto[]> {
    const entries = await this.service.findAll({}, request.context)
    return entries.map(FormulationNutrition_TE_ResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, FormulationNutrition_TE)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<FormulationNutrition_TE_ResponseDto> {
    const entry = await this.service.findById(id, request.context)
    return FormulationNutrition_TE_ResponseDto.fromDomain(entry)
  }

  @Get('by-revision/:revisionId')
  @Authorize(Action.Read, FormulationNutrition_TE)
  async findByRevision(
    @Param('revisionId', ParseUUIDPipe) revisionId: string,
    @Req() request: Request
  ): Promise<FormulationNutrition_TE_ResponseDto[]> {
    const entries = await this.service.findByRevisionId(
      revisionId,
      request.context
    )
    return entries.map(FormulationNutrition_TE_ResponseDto.fromDomain)
  }

  @Patch(':id')
  @Authorize(Action.Manage, FormulationNutrition_TE)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFormulationNutrition_TEDto,
    @Req() request: Request
  ): Promise<FormulationNutrition_TE_ResponseDto> {
    const entry = await this.service.findById(id, request.context)

    if (dto.declaredValue !== undefined)
      entry.changeDeclaredValue(dto.declaredValue)
    if (dto.calculatedValue !== undefined)
      entry.changeCalculatedValue(dto.calculatedValue)
    if (dto.refValue !== undefined) entry.changeRefValue(dto.refValue)
    if (dto.notes !== undefined) entry.changeNotes(dto.notes)

    const saved = await this.service.save(entry, request.context)
    return FormulationNutrition_TE_ResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Manage, FormulationNutrition_TE)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }
}
