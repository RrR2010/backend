import { Injectable } from '@nestjs/common'
import { CreateUserDto } from '@users/user.dto'
import { UserRepository, UserFilter } from '@users/user.repository'
import { RequestContext } from '@authorization/authorization.types'
import { User } from '@users/user.entity'

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(dto: CreateUserDto, context: RequestContext): Promise<User> {
    const user = User.create({
      scope: dto.scope
    })

    await this.userRepository.save(user)
    return user
  }

  async findAll(
    filter?: UserFilter,
    context?: RequestContext
  ): Promise<User[]> {
    return this.userRepository.findAll(filter)
  }

  async findById(id: string, context: RequestContext): Promise<User | null> {
    return this.userRepository.findById(id)
  }

  async save(user: User, context: RequestContext): Promise<User> {
    return this.userRepository.save(user)
  }

  async delete(id: string, context: RequestContext): Promise<void> {
    await this.userRepository.delete(id)
  }
}