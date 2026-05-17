export abstract class PasswordHasher {
  abstract hash(password: string): Promise<string>
  abstract compare(password: string, hash: string): Promise<boolean>
}

import * as bcrypt from 'bcrypt'

export class BcryptPasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, 10)
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash)
  }
}
