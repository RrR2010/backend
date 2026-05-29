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
  CreateTenantSiteDto,
  CreateTenantSiteResponseDto,
  TenantSiteResponseDto,
  UpdateTenantSiteDto
} from '@tenant-sites/tenant-site.dto'
import { TenantSiteService } from '@tenant-sites/tenant-site.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import type { RequestContext } from '@authorization/authorization.types'
import { TenantSite } from '@tenant-sites/tenant-site.entity'

@ApiTags('Tenant Sites')
@ApiBearerAuth('accessToken')
@Controller('tenant-sites')
export class TenantSitesController {
  constructor(private readonly service: TenantSiteService) {}

  @Post()
  @Authorize(Action.Create, TenantSite)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateTenantSiteDto,
    @Req() request: Request
  ): Promise<CreateTenantSiteResponseDto> {
    const site = await this.service.create(
      {
        tenantId: dto.tenantId,
        name: dto.name,
        legalName: dto.legalName,
        externalId: dto.externalId ?? null,
        taxId: dto.taxId,
        siteType: dto.siteType,
        isHeadquarters: dto.isHeadquarters
      },
      request.context
    )
    return CreateTenantSiteResponseDto.fromDomain(site)
  }

  @Get()
  @Authorize(Action.Read, TenantSite)
  async findAll(@Req() request: Request): Promise<TenantSiteResponseDto[]> {
    const sites = await this.service.findAll({}, request.context)
    return sites.map(TenantSiteResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, TenantSite)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<TenantSiteResponseDto> {
    const site = await this.service.findById(id, request.context)
    return TenantSiteResponseDto.fromDomain(site)
  }

  @Patch(':id')
  @Authorize(Action.Update, TenantSite)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTenantSiteDto,
    @Req() request: Request
  ): Promise<TenantSiteResponseDto> {
    const site = await this.service.findById(id, request.context)

    if (dto.name) site.changeName(dto.name)
    if (dto.legalName) site.changeLegalName(dto.legalName)
    if (dto.externalId !== undefined) site.changeExternalId(dto.externalId)
    if (dto.taxId) site.changeTaxId(dto.taxId)
    if (dto.siteType) site.changeSiteType(dto.siteType)
    if (dto.isHeadquarters === true) site.setAsHeadquarters()
    else if (dto.isHeadquarters === false) site.unsetAsHeadquarters()

    const saved = await this.service.save(site, request.context)
    return TenantSiteResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, TenantSite)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, TenantSite)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<TenantSiteResponseDto> {
    const site = await this.service.activate(id, request.context)
    return TenantSiteResponseDto.fromDomain(site)
  }

  @Post(':id/lock')
  @Authorize(Action.Update, TenantSite)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<TenantSiteResponseDto> {
    const site = await this.service.lock(id, request.context)
    return TenantSiteResponseDto.fromDomain(site)
  }
}
