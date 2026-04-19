import { Email } from '@core/domain/email.vo';
import { PlatformRole } from '@core/domain/platform-role.enum';
import { User } from '@modules/users/domain/user.entity';
import { UserRepository } from '@modules/users/domain/user.repository';
import { PasswordHasher } from '@modules/auth/domain/password-hasher';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: {
    email: string;
    password: string;
    name: string;
    platformRole: PlatformRole | null;
    code: string | null;
  }): Promise<User> {
    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = await this.userRepository.save(
      User.create({
        platformRole: input.platformRole || PlatformRole.MEMBER,
        name: input.name,
        email: Email.from(input.email),
        passwordHash: passwordHash,
        code: input.code?.toString() || null,
      }),
    );

    return user;
  }
}
