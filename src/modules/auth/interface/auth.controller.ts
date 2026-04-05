import { Body, Controller, Post, Headers } from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './login.dto';
import { LoginUseCase } from '@modules/auth/application/login.usecase';
import { SelectTenantUseCase } from '@modules/auth/application/select-tenant.usecase';
import { LoginResponseDto } from './login-response.dto';
import { SelectTenantDto } from './select-tenant.dto';
import { SelectTenantResponseDto } from './select-tenant-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private loginUseCase: LoginUseCase,
    private selectTenantUseCase: SelectTenantUseCase,
  ) {}
  @Post('login')
  @ApiConsumes('application/json')
  async login(@Body() input: LoginDto): Promise<LoginResponseDto> {
    return await this.loginUseCase.execute(input);
  }

  @Post('select-tenant')
  @ApiConsumes('application/json')
  async selectTenant(
    @Headers('x-pre-auth-token') preAuthToken: string,
    @Body() input: SelectTenantDto,
  ): Promise<SelectTenantResponseDto> {
    return await this.selectTenantUseCase.execute(preAuthToken, input.tenantId);
  }
}
