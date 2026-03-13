import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateTenantUseCase } from '../application/use-cases/create-tenant.usecase';
import { ListTenantsUseCase } from '../application/use-cases/list-tenants.usecase';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { CreateTenantResponseDto } from './dto/create-tenant-response.dto';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantsController {
  constructor(
    private readonly createTenantUseCase: CreateTenantUseCase,
    private readonly listTenantsUseCase: ListTenantsUseCase,
  ) {}

  @Post()
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
