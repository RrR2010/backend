import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CreateTenantUseCase } from '../application/create-tenant.usecase';
import { ListTenantsUseCase } from '../application/list-tenants.usecase';
import { CreateTenantDto } from './create-tenant.dto';
import { CreateTenantResponseDto } from './create-tenant-response.dto';
import { Authorize } from '@modules/authorization/interface/authorization.decorator';
import { PermissionAction, PermissionSubject } from '@core/domain/authorization';

@ApiTags('Tenants')
@ApiBearerAuth('accessToken')
@Controller('tenants')
export class TenantsController {
  constructor(
    private readonly createTenantUseCase: CreateTenantUseCase,
    private readonly listTenantsUseCase: ListTenantsUseCase,
  ) {}

  @Post()
  @Authorize({
    permission: { action: PermissionAction.Create, subject: PermissionSubject.Tenant },
  })
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  async create(@Body() dto: CreateTenantDto): Promise<CreateTenantResponseDto> {
    const tenant = await this.createTenantUseCase.execute(dto);
    return CreateTenantResponseDto.fromDomain(tenant);
  }

  @Get()
  @Authorize({
    permission: { action: PermissionAction.Read, subject: PermissionSubject.Tenant },
  })
  async list(): Promise<CreateTenantResponseDto[]> {
    const tenants = await this.listTenantsUseCase.execute();
    return tenants.map((tenant) => CreateTenantResponseDto.fromDomain(tenant));
  }
}
