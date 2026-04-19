import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CreateUserUseCase } from '@modules/users/application/create-user.usecase';
import { ListUsersUseCase } from '@modules/users/application/list-users.usecase';
import { CreateUserDto } from '@modules/users/interface/create-user.dto';
import { CreateUserResponseDto } from '@modules/users/interface/create-user-response.dto';
import { JwtAuthGuard } from '@modules/auth/infra/jwt-auth.guard';
import { TenantContextGuard } from '@modules/auth/infra/tenant-context.guard';

@ApiTags('Users')
@ApiBearerAuth('accessToken')
@Controller('users')
@UseGuards(JwtAuthGuard, TenantContextGuard)
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
  ) {}

  @Post()
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  async create(@Body() dto: CreateUserDto): Promise<CreateUserResponseDto> {
    const user = await this.createUserUseCase.execute(dto);
    return CreateUserResponseDto.fromDomain(user);
  }

  @Get(':tenantId') // TODO Find a user friendly way to get this param. The way it is now appears that it's being passed a userId instead of a tenantId.
  async list(
    @Param('tenantId') tenantId: string,
  ): Promise<CreateUserResponseDto[]> {
    const users = await this.listUsersUseCase.execute(tenantId);
    return users.map((user) => CreateUserResponseDto.fromDomain(user));
  }
}
