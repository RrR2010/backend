import { User as PrismaUser } from '@prisma/client';
import { User } from '@modules/users/domain/entities/user.entity';
import { Email } from '@core/domain/value-objects/email.vo';
import { Id } from '@core/domain/value-objects/id.vo';
import { UserPlatformRole } from '@modules/users/domain/enums/user-role.enum';
import { UserStatus } from '@modules/users/domain/enums/user-status.enum';
import { UserStatus as PrismaUserStatus } from '@prisma/client';

export class PrismaUserMapper {
  static toDomain(bdUser: PrismaUser): User {
    return User.rehydrate({
      id: Id.from(bdUser.id),
      name: bdUser.name,
      email: Email.from(bdUser.email),
      passwordHash: bdUser.passwordHash,
      platformRole:
        UserPlatformRole[bdUser.role as keyof typeof UserPlatformRole],
      code: bdUser.code,
      status: UserStatus[bdUser.status as keyof typeof UserStatus],
      createdAt: bdUser.createdAt,
      updatedAt: bdUser.updatedAt,
    });
  }

  static toPersistence(user: User) {
    return {
      id: user.id.value,
      name: user.name,
      email: user.email.value,
      passwordHash: user.passwordHash,
      platformRole: user.role,
      code: user.code,
      status: PrismaUserStatus[user.status as keyof typeof PrismaUserStatus],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
