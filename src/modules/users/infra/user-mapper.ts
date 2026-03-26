import { User as PrismaUser } from '@prisma/client';
import { User } from '@modules/users/domain/user.entity';
import { Id } from '@core/domain/id.vo';
import { EntityStatus } from '@core/domain/entity-status.enum';
import { Email } from '@core/domain/email.vo';

export class PrismaUserMapper {
  static toDomain(prismaUser: PrismaUser): User {
    return User.rehydrate({
      id: Id.from(prismaUser.id),
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
      entityStatus:
        EntityStatus[prismaUser.entityStatus as keyof typeof EntityStatus],
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
      entityStatus: user.entityStatus,
      name: user.name,
      email: user.email.value,
      passwordHash: user.passwordHash,
      code: user.code,
    };
  }
}
