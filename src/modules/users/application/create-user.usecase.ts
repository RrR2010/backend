import { Email } from '@core/domain/email.vo';
import {
  PlatformRole,
  PlatformRoleHelpers,
} from '@core/domain/platform-role.enum';
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
    platformRoles?: PlatformRole[];
    code: string | null;
  }): Promise<User> {
    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = await this.userRepository.save(
      User.create({
        platformRoles:
          input.platformRoles || PlatformRoleHelpers.getDefault(),
        name: input.name,
        email: Email.from(input.email),
        passwordHash: passwordHash,
        code: input.code?.toString() || null,
      }),
    );

    return user;
  }
}
