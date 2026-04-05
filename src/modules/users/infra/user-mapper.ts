import { User as PrismaUser } from '@prisma/client';
import { User } from '@modules/users/domain/user.entity';
import { Id } from '@core/domain/id.vo';
import { SystemState } from '@core/domain/system-state.enum';
import { Email } from '@core/domain/email.vo';
import { PlatformRoles } from '@core/domain/platform-roles.enum';

export class PrismaUserMapper {
  static toDomain(prismaUser: PrismaUser): User {
    return User.rehydrate({
      id: Id.from(prismaUser.id),
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
      systemState:
        SystemState[prismaUser.systemState as keyof typeof SystemState],
      platformRole:
        PlatformRoles[prismaUser.platformRole as keyof typeof PlatformRoles],
      name: prismaUser.name,
      email: Email.from(prismaUser.email),
      passwordHash: prismaUser.passwordHash,
      code: prismaUser.code,
    });
  }

  static toPersistence(user: User) {
    return {
      id: user.id.value,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      systemState: user.systemState,
      platformRole: user.platformRole,
      name: user.name,
      email: user.email.value,
      passwordHash: user.passwordHash,
      code: user.code,
    };
  }
}
