import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateUserUseCase } from '../application/create-user.usecase';
import { ListUsersUseCase } from '../application/list-users.usecase';
import { CreateUserDto } from '@modules/users/interface/create-user.dto';
import { CreateUserResponseDto } from '@modules/users/interface/create-user-response.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateUserDto): Promise<CreateUserResponseDto> {
    const user = await this.createUserUseCase.execute(dto);
    return CreateUserResponseDto.fromDomain(user);
  }

  @Get(':tenantId')
  async list(
    @Param('tenantId') tenantId: string,
  ): Promise<CreateUserResponseDto[]> {
    const users = await this.listUsersUseCase.execute(tenantId);
    return users.map((user) => CreateUserResponseDto.fromDomain(user));
  }
}
