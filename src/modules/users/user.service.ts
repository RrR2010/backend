import { Injectable } from '@nestjs/common'
import { CreateUserDto } from '@users/user.dto'
import { UserRepository, UserFilter } from '@users/user.repository'
import { RequestContext } from '@authorization/authorization.types'
import { User } from '@users/user.entity'

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(dto: CreateUserDto, ctx: RequestContext): Promise<User> {
    const user = User.create({
      scope: dto.scope
    })

    await this.userRepository.save(user, ctx)
    return user
  }

  async findAll(filter: UserFilter, ctx: RequestContext): Promise<User[]> {
    return this.userRepository.findAll(filter, ctx)
  }

  async findById(id: string, ctx: RequestContext): Promise<User | null> {
    return this.userRepository.findById(id, ctx)
  }

  async save(user: User, ctx: RequestContext): Promise<User> {
    return this.userRepository.save(user, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    await this.userRepository.delete(id, ctx)
  }
}
