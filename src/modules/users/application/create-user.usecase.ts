import { Email } from '@core/domain/email.vo';
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
        name: input.name,
        email: Email.from(input.email),
        passwordHash: input.password,
        code: input.code?.toString() || null,
      }),
    );

    return user;
  }
}
