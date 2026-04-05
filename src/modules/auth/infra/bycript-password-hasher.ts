import { PasswordHasher } from '@modules/auth/domain/password-hasher';
import * as bcrypt from 'bcrypt';

export class BcryptPasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
