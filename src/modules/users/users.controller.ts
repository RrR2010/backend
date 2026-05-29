import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Patch,
  ParseUUIDPipe,
  Req,
  BadRequestException
} from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import {
  CreateUserDto,
  CreateUserResponseDto,
  UserResponseDto
} from '@users/user.dto'
import { UserNotFoundError } from '@users/user.errors'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
// import type { RequestContext } from '@authorization/authorization.types' // unused import removed
import { User } from '@users/user.entity'
import { UserService } from '@users/user.service'
import { UserScope, PlatformRole, TenantRole } from '@users/user.types'

@ApiTags('Users')
@ApiBearerAuth('accessToken')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Authorize(Action.Create, User)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateUserDto,
    @Req() request: Request
  ): Promise<CreateUserResponseDto> {
    const user = await this.userService.create(dto, request.context)
    return CreateUserResponseDto.fromDomain(user)
  }

  @Get()
  @Authorize(Action.Read, User)
  async findAll(@Req() request: Request): Promise<UserResponseDto[]> {
    const users = await this.userService.findAll({}, request.context)
    return users.map((user) => UserResponseDto.fromDomain(user))
  }

  @Get(':id')
  @Authorize(Action.Read, User)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<UserResponseDto | null> {
    const user = await this.userService.findById(id, request.context)
    return user ? UserResponseDto.fromDomain(user) : null
  }

  @Patch(':id')
  @Authorize(Action.Update, User)
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateUserDto,
    @Req() request: Request
  ): Promise<UserResponseDto> {
    const existingUser = await this.userService.findById(id, request.context)
    if (!existingUser) {
      throw new UserNotFoundError(id)
    }

    // Update scope if provided
    if (dto.scope) {
      // For now, scope is immutable after creation
      // Could add domain methods to handle this
    }

    const user = await this.userService.save(existingUser, request.context)
    return UserResponseDto.fromDomain(user)
  }

  @Delete(':id')
  @Authorize(Action.Delete, User)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.userService.delete(id, request.context)
  }
}
