import { User } from '@modules/users/domain/entities/user.entity';

export abstract class UserRepository {
  abstract findById(id: string, tenantId: string): Promise<User | null>;
  abstract findByEmail(email: string, tenantId: string): Promise<User | null>;
  abstract findByName(name: string, tenantId: string): Promise<User[]>;
  abstract findAll(tenantId: string): Promise<User[]>;
  abstract save(user: User): Promise<User>;
  abstract delete(id: string): Promise<void>;
}
