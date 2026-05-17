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
import type { Request } from 'express'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import {
  CreateTenantDto,
  CreateTenantResponseDto,
  TenantResponseDto
} from '@tenants/tenant.dto'
import { TenantNotFoundError } from '@tenants/tenant.errors'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import type { RequestContext } from '@authorization/authorization.types'
import { Tenant } from '@tenants/tenant.entity'
import { TenantService } from '@tenants/tenant.service'

@ApiTags('Tenants')
@ApiBearerAuth('accessToken')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantService: TenantService) {}


  @Post()
  @Authorize(Action.Create, Tenant)
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  async create(
    @Body() dto: CreateTenantDto,
    @Req() request: Request
  ): Promise<CreateTenantResponseDto> {
    const tenant = await this.tenantService.create(dto, request.context)
    return CreateTenantResponseDto.fromDomain(tenant)
  }

  @Get()
  @Authorize(Action.Read, Tenant)
  async findAll(@Req() request: Request): Promise<TenantResponseDto[]> {
    const tenants = await this.tenantService.findAll({}, request.context)
    return tenants.map((tenant) => TenantResponseDto.fromDomain(tenant))
  }

  @Get(':id')
  @Authorize(Action.Read, Tenant)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<TenantResponseDto | null> {
    const tenant = await this.tenantService.findById(id, request.context)
    return tenant ? TenantResponseDto.fromDomain(tenant) : null
  }

  @Patch(':id')
  @Authorize(Action.Update, Tenant)
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateTenantDto>,
    @Req() request: Request
  ): Promise<TenantResponseDto> {
    const tenant = await this.tenantService.findById(id, request.context)
    if (!tenant) {
      throw new TenantNotFoundError(id)
    }
    if (dto.name) {
      tenant.changeName(dto.name)
    }
    const saved = await this.tenantService.save(tenant, request.context)
    return TenantResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, Tenant)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.tenantService.delete(id, request.context)
  }
}
