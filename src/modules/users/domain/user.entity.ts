import { Id } from '@core/domain/id.vo';
import { Email } from '@core/domain/email.vo';
import { Entity, EntityProps } from '@core/domain/entity';
import { EntityStatus } from '@core/domain/entity-status.enum';

interface UserProps extends EntityProps {
  name: string;
  email: Email;
  passwordHash: string;
  code: string | null;
}

interface CreateUserProps extends Omit<
  UserProps,
  'id' | 'createdAt' | 'updatedAt' | 'entityStatus'
> {
  passwordHash: string;
}

export class User extends Entity<UserProps> {
  private constructor(props: UserProps) {
    super(props);
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateUserProps): User {
    const now = new Date();
    const user = new User({
      ...props,
      id: Id.generate(),
      name: props.name,
      createdAt: now,
      updatedAt: now,
      entityStatus: EntityStatus.ACTIVE,
      passwordHash: props.passwordHash, // TODO: implement hash
    });
    return user;
  }

  static rehydrate(props: UserProps): User {
    return new User(props);
  }

  // --------------- Getters ---------------

  get name(): string {
    return this._props.name;
  }

  get email(): Email {
    return this._props.email;
  }

  get passwordHash(): string {
    return this._props.passwordHash;
  }

  get code(): string | null {
    return this._props.code;
  }

  // --------------- Behaviours ---------------
  changeName(newName: string) {
    this._props.name = newName;
    this.touch();
  }

  changeEmail(newEmail: Email) {
    this._props.email = newEmail;
    this.touch();
  }

  changePasswordHash(newPasswordHash: string) {
    this._props.passwordHash = newPasswordHash;
    this.touch();
  }

  changeCode(newCode: string) {
    this._props.code = newCode;
    this.touch();
  }

  // --------------- Internal Methods ---------------
}
