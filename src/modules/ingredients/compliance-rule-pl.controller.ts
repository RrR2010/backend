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
  CreateComplianceRule_PLDto,
  CreateComplianceRule_PLResponseDto,
  ComplianceRule_PLResponseDto,
  UpdateComplianceRule_PLDto
} from '@ingredients/compliance-rule-pl.dto'
import { ComplianceRule_PLService } from '@ingredients/compliance-rule-pl.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { ComplianceRule_PL } from '@ingredients/compliance-rule-pl.entity'

@ApiTags('Compliance Rules PL')
@ApiBearerAuth('accessToken')
@Controller('compliance-rules-pl')
export class ComplianceRule_PLController {
  constructor(private readonly service: ComplianceRule_PLService) {}

  @Post()
  @Authorize(Action.Manage, ComplianceRule_PL)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateComplianceRule_PLDto,
    @Req() request: Request
  ): Promise<CreateComplianceRule_PLResponseDto> {
    const entity = await this.service.create(
      {
        code: dto.code,
        category: dto.category,
        ruleType: dto.ruleType,
        description: dto.description,
        condition: dto.condition ?? null,
        severity: dto.severity ?? 'ERROR',
        regulationId: dto.regulationId,
        nutrientId: dto.nutrientId ?? null
      },
      request.context
    )
    return CreateComplianceRule_PLResponseDto.fromDomain(entity)
  }

  @Get()
  @Authorize(Action.Read, ComplianceRule_PL)
  async findAll(
    @Req() request: Request
  ): Promise<ComplianceRule_PLResponseDto[]> {
    const entities = await this.service.findAll(request.context)
    return entities.map((e) => ComplianceRule_PLResponseDto.fromDomain(e))
  }

  @Get('by-regulation/:regulationId')
  @Authorize(Action.Read, ComplianceRule_PL)
  async findByRegulation(
    @Param('regulationId', ParseUUIDPipe) regulationId: string,
    @Req() request: Request
  ): Promise<ComplianceRule_PLResponseDto[]> {
    const entities = await this.service.findByRegulation(
      regulationId,
      request.context
    )
    return entities.map((e) => ComplianceRule_PLResponseDto.fromDomain(e))
  }

  @Get(':id')
  @Authorize(Action.Read, ComplianceRule_PL)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<ComplianceRule_PLResponseDto> {
    const entity = await this.service.findById(id, request.context)
    return ComplianceRule_PLResponseDto.fromDomain(entity)
  }

  @Patch(':id')
  @Authorize(Action.Manage, ComplianceRule_PL)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateComplianceRule_PLDto,
    @Req() request: Request
  ): Promise<ComplianceRule_PLResponseDto> {
    const entity = await this.service.findById(id, request.context)
    if (dto.code) entity.changeCode(dto.code)
    if (dto.category) entity.changeCategory(dto.category)
    if (dto.ruleType) entity.changeRuleType(dto.ruleType)
    if (dto.description) entity.changeDescription(dto.description)
    if (dto.condition !== undefined) entity.changeCondition(dto.condition)
    if (dto.severity !== undefined) entity.changeSeverity(dto.severity)
    if (dto.regulationId) entity.changeRegulationId(dto.regulationId)
    if (dto.nutrientId !== undefined) entity.changeNutrientId(dto.nutrientId)
    const saved = await this.service.save(entity, request.context)
    return ComplianceRule_PLResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Manage, ComplianceRule_PL)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Manage, ComplianceRule_PL)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<ComplianceRule_PLResponseDto> {
    const entity = await this.service.activate(id, request.context)
    return ComplianceRule_PLResponseDto.fromDomain(entity)
  }

  @Post(':id/lock')
  @Authorize(Action.Manage, ComplianceRule_PL)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<ComplianceRule_PLResponseDto> {
    const entity = await this.service.lock(id, request.context)
    return ComplianceRule_PLResponseDto.fromDomain(entity)
  }

  @Post(':id/unlock')
  @Authorize(Action.Manage, ComplianceRule_PL)
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<ComplianceRule_PLResponseDto> {
    const entity = await this.service.unlock(id, request.context)
    return ComplianceRule_PLResponseDto.fromDomain(entity)
  }
}
