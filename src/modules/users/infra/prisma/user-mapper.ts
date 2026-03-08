import { User as PrismaUser } from '@prisma/client';
import { User } from '@modules/users/domain/entities/user.entity';
import { Email } from '@core/domain/value-objects/email.vo';
import { Id } from '@core/domain/value-objects/id.vo';
import { UserRole } from '@modules/users/domain/enums/user-role.enum';
import { UserStatus } from '@modules/users/domain/enums/user-status.enum';

export class PrismaUserMapper {
  static toDomain(bdUser: PrismaUser): User {
    return User.rehydrate({
      id: Id.from(bdUser.id),
      name: bdUser.name,
      email: Email.from(bdUser.email),
      tenantId: Id.from(bdUser.tenantId),
      passwordHash: bdUser.passwordHash,
      role: UserRole[bdUser.role as keyof typeof UserRole],
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
      tenantId: user.tenantId.value,
      passwordHash: user.passwordHash,
      role: user.role,
      code: user.code,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
