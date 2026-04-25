import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CreateUserUseCase } from '@modules/users/application/create-user.usecase';
import { ListUsersUseCase } from '@modules/users/application/list-users.usecase';
import { CreateUserDto } from '@modules/users/interface/create-user.dto';
import { CreateUserResponseDto } from '@modules/users/interface/create-user-response.dto';
import { Authorize } from '@modules/authorization/interface/authorization.decorator';
import { PermissionAction, PermissionSubject } from '@core/domain/authorization';

@ApiTags('Users')
@ApiBearerAuth('accessToken')
@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
  ) {}

  @Post()
  @Authorize({
    permission: { action: PermissionAction.Create, subject: PermissionSubject.User },
  })
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  async create(@Body() dto: CreateUserDto): Promise<CreateUserResponseDto> {
    const user = await this.createUserUseCase.execute(dto);
    return CreateUserResponseDto.fromDomain(user);
  }

  @Get()
  @Authorize({
    permission: { action: PermissionAction.Read, subject: PermissionSubject.User },
  })
  async list(): Promise<CreateUserResponseDto[]> {
    const users = await this.listUsersUseCase.execute();
    return users.map((user) => CreateUserResponseDto.fromDomain(user));
  }
}