import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Patch,
  ParseUUIDPipe
} from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import {
  CreateTenantSiteDto,
  CreateTenantSiteResponseDto,
  TenantSiteResponseDto,
  UpdateTenantSiteDto
} from '@tenant-sites/tenant-site.dto'
import { TenantSiteService } from '@tenant-sites/tenant-site.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
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
    @Body() dto: CreateTenantSiteDto
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
      null as any
    )
    return CreateTenantSiteResponseDto.fromDomain(site)
  }

  @Get()
  @Authorize(Action.Read, TenantSite)
  async findAll(): Promise<TenantSiteResponseDto[]> {
    const sites = await this.service.findAll(undefined, null as any)
    return sites.map(TenantSiteResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, TenantSite)
  async findById(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<TenantSiteResponseDto> {
    const site = await this.service.findById(id, null as any)
    return TenantSiteResponseDto.fromDomain(site)
  }

  @Patch(':id')
  @Authorize(Action.Update, TenantSite)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTenantSiteDto
  ): Promise<TenantSiteResponseDto> {
    const site = await this.service.findById(id, null as any)

    if (dto.name) site.changeName(dto.name)
    if (dto.legalName) site.changeLegalName(dto.legalName)
    if (dto.externalId !== undefined) site.changeExternalId(dto.externalId)
    if (dto.taxId) site.changeTaxId(dto.taxId)
    if (dto.siteType) site.changeSiteType(dto.siteType)
    if (dto.isHeadquarters === true) site.setAsHeadquarters()
    else if (dto.isHeadquarters === false) site.unsetAsHeadquarters()

    const saved = await this.service.save(site, null as any)
    return TenantSiteResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, TenantSite)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.service.delete(id, null as any)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, TenantSite)
  async activate(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<TenantSiteResponseDto> {
    const site = await this.service.activate(id, null as any)
    return TenantSiteResponseDto.fromDomain(site)
  }

  @Post(':id/lock')
  @Authorize(Action.Update, TenantSite)
  async lock(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<TenantSiteResponseDto> {
    const site = await this.service.lock(id, null as any)
    return TenantSiteResponseDto.fromDomain(site)
  }
}