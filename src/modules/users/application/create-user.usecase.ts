import { Email } from '@core/domain/email.vo';
import { Id } from '@core/domain/id.vo';
import { User } from '@modules/users/domain/user.entity';
import { UserRepository } from '@modules/users/domain/user.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: {
    tenantId: string;
    email: string;
    password: string;
    name: string;
    code: string | null;
  }): Promise<User> {
    const user = await this.userRepository.save(
      User.create({
        tenantId: Id.from(input.tenantId),
        email: Email.from(input.email),
        password: input.password,
        name: input.name,
        code: input.code,
      }),
    );
    return user;
  }
}
