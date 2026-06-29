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
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import {
  CreateCompany_TEDto,
  CreateCompany_TE_ResponseDto,
  Company_TE_ResponseDto,
  UpdateCompany_TEDto
} from '@ingredients/company.dto'
import { CompanyService } from '@ingredients/company.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { Company_TE } from '@ingredients/company.entity'

@ApiTags('Companies')
@ApiBearerAuth('accessToken')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly service: CompanyService) {}

  @Post()
  @Authorize(Action.Create, Company_TE)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateCompany_TEDto,
    @Req() request: Request
  ): Promise<CreateCompany_TE_ResponseDto> {
    const company = await this.service.create(
      {
        name: dto.name,
        type: dto.type,
        contactInfo: dto.contactInfo ?? null,
        taxId: dto.taxId ?? null
      },
      request.context
    )
    return CreateCompany_TE_ResponseDto.fromDomain(company)
  }

  @Get()
  @Authorize(Action.Read, Company_TE)
  async findAll(
    @Req() request: Request,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ): Promise<Company_TE_ResponseDto[]> {
    const take = limit ? Math.min(parseInt(limit, 10), 500) : 100
    const skip = offset ? parseInt(offset, 10) : 0
    const companies = await this.service.findAll({ skip, take }, request.context)
    return companies.map(Company_TE_ResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, Company_TE)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<Company_TE_ResponseDto> {
    const company = await this.service.findById(id, request.context)
    return Company_TE_ResponseDto.fromDomain(company)
  }

  @Patch(':id')
  @Authorize(Action.Update, Company_TE)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCompany_TEDto,
    @Req() request: Request
  ): Promise<Company_TE_ResponseDto> {
    const company = await this.service.findById(id, request.context)

    if (dto.name) company.changeName(dto.name)
    if (dto.type) company.changeType(dto.type)
    if (dto.contactInfo !== undefined)
      company.changeContactInfo(dto.contactInfo)
    if (dto.taxId !== undefined) company.changeTaxId(dto.taxId)

    const saved = await this.service.save(company, request.context)
    return Company_TE_ResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, Company_TE)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, Company_TE)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<Company_TE_ResponseDto> {
    const company = await this.service.activate(id, request.context)
    return Company_TE_ResponseDto.fromDomain(company)
  }

  @Post(':id/lock')
  @Authorize(Action.Update, Company_TE)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<Company_TE_ResponseDto> {
    const company = await this.service.lock(id, request.context)
    return Company_TE_ResponseDto.fromDomain(company)
  }

  @Post(':id/unlock')
  @Authorize(Action.Unlock, Company_TE)
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<Company_TE_ResponseDto> {
    const company = await this.service.unlock(id, request.context)
    return Company_TE_ResponseDto.fromDomain(company)
  }
}
