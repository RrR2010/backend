import { Injectable } from '@nestjs/common';
import { UserRepository } from '@modules/users/domain/user.repository';

@Injectable()
export class ListUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(tenantId: string) {
    return this.userRepository.findAll(tenantId);
  }
}
