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
  CreateTenantDto,
  CreateTenantResponseDto,
  TenantResponseDto
} from '@tenants/tenant.dto'
import { TenantNotFoundError } from '@tenants/tenant.errors'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
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
  async create(@Body() dto: CreateTenantDto): Promise<CreateTenantResponseDto> {
    const tenant = await this.tenantService.create(dto, null as any)
    return CreateTenantResponseDto.fromDomain(tenant)
  }

  @Get()
  @Authorize(Action.Read, Tenant)
  async findAll(): Promise<TenantResponseDto[]> {
    const tenants = await this.tenantService.findAll(undefined, null as any)
    return tenants.map((tenant) => TenantResponseDto.fromDomain(tenant))
  }

  @Get(':id')
  @Authorize(Action.Read, Tenant)
  async findById(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<TenantResponseDto | null> {
    const tenant = await this.tenantService.findById(id, null as any)
    return tenant ? TenantResponseDto.fromDomain(tenant) : null
  }

  @Patch(':id')
  @Authorize(Action.Update, Tenant)
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateTenantDto>
  ): Promise<TenantResponseDto> {
    const tenant = await this.tenantService.findById(id, null as any)
    if (!tenant) {
      throw new TenantNotFoundError(id)
    }
    if (dto.name) {
      tenant.changeName(dto.name)
    }
    const saved = await this.tenantService.save(tenant, null as any)
    return TenantResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, Tenant)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.tenantService.delete(id, null as any)
  }
}
