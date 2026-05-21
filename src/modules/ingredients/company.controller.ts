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
  CreateCompanyDto,
  CreateCompanyResponseDto,
  CompanyResponseDto,
  UpdateCompanyDto
} from '@ingredients/company.dto'
import { CompanyService } from '@ingredients/company.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { Company } from '@ingredients/company.entity'

@ApiTags('Companies')
@ApiBearerAuth('accessToken')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly service: CompanyService) {}

  @Post()
  @Authorize(Action.Create, Company)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateCompanyDto,
    @Req() request: Request
  ): Promise<CreateCompanyResponseDto> {
    const company = await this.service.create(
      {
        tenantId: dto.tenantId,
        name: dto.name,
        type: dto.type,
        contactInfo: dto.contactInfo ?? null,
        taxId: dto.taxId ?? null
      },
      request.context
    )
    return CreateCompanyResponseDto.fromDomain(company)
  }

  @Get()
  @Authorize(Action.Read, Company)
  async findAll(@Req() request: Request): Promise<CompanyResponseDto[]> {
    const companies = await this.service.findAll({}, request.context)
    return companies.map(CompanyResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, Company)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<CompanyResponseDto> {
    const company = await this.service.findById(id, request.context)
    return CompanyResponseDto.fromDomain(company)
  }

  @Patch(':id')
  @Authorize(Action.Update, Company)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCompanyDto,
    @Req() request: Request
  ): Promise<CompanyResponseDto> {
    const company = await this.service.findById(id, request.context)

    if (dto.name) company.changeName(dto.name)
    if (dto.type) company.changeType(dto.type)
    if (dto.contactInfo !== undefined) company.changeContactInfo(dto.contactInfo)
    if (dto.taxId !== undefined) company.changeTaxId(dto.taxId)

    const saved = await this.service.save(company, request.context)
    return CompanyResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, Company)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, Company)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<CompanyResponseDto> {
    const company = await this.service.activate(id, request.context)
    return CompanyResponseDto.fromDomain(company)
  }

  @Post(':id/lock')
  @Authorize(Action.Update, Company)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<CompanyResponseDto> {
    const company = await this.service.lock(id, request.context)
    return CompanyResponseDto.fromDomain(company)
  }
}
