import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CreateTenantUseCase } from '../application/create-tenant.usecase';
import { ListTenantsUseCase } from '../application/list-tenants.usecase';
import { CreateTenantDto } from './create-tenant.dto';
import { CreateTenantResponseDto } from './create-tenant-response.dto';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantsController {
  constructor(
    private readonly createTenantUseCase: CreateTenantUseCase,
    private readonly listTenantsUseCase: ListTenantsUseCase,
  ) {}

  @Post()
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  async create(@Body() dto: CreateTenantDto): Promise<CreateTenantResponseDto> {
    const tenant = await this.createTenantUseCase.execute(dto);
    return CreateTenantResponseDto.fromDomain(tenant);
  }

  @Get()
  async list(): Promise<CreateTenantResponseDto[]> {
    const tenants = await this.listTenantsUseCase.execute();
    return tenants.map((tenant) => CreateTenantResponseDto.fromDomain(tenant));
  }
}
