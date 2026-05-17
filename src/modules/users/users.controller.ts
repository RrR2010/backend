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
  CreateUserDto,
  CreateUserResponseDto,
  UserResponseDto
} from '@users/user.dto'
import { UserNotFoundError } from '@users/user.errors'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { User } from '@users/user.entity'
import { UserService } from '@users/user.service'

@ApiTags('Users')
@ApiBearerAuth('accessToken')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Authorize(Action.Create, User)
  @ApiConsumes('application/json')
  async create(@Body() dto: CreateUserDto): Promise<CreateUserResponseDto> {
    const user = await this.userService.create(dto, null as any)
    return CreateUserResponseDto.fromDomain(user)
  }

  @Get()
  @Authorize(Action.Read, User)
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userService.findAll(undefined, null as any)
    return users.map((user) => UserResponseDto.fromDomain(user))
  }

  @Get(':id')
  @Authorize(Action.Read, User)
  async findById(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<UserResponseDto | null> {
    const user = await this.userService.findById(id, null as any)
    return user ? UserResponseDto.fromDomain(user) : null
  }

  @Patch(':id')
  @Authorize(Action.Update, User)
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateUserDto
  ): Promise<UserResponseDto> {
    const existingUser = await this.userService.findById(id, null as any)
    if (!existingUser) {
      throw new UserNotFoundError(id)
    }

    // Update scope if provided
    if (dto.scope) {
      // For now, scope is immutable after creation
      // Could add domain methods to handle this
    }

    const user = await this.userService.save(existingUser, null as any)
    return UserResponseDto.fromDomain(user)
  }

  @Delete(':id')
  @Authorize(Action.Delete, User)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.userService.delete(id, null as any)
  }
}
