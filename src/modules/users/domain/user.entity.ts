import { Id } from '@core/domain/id.vo';
import { UserStatus } from '@modules/users/domain/user-status.enum';
import { Email } from '@core/domain/email.vo';
import { Entity, EntityProps } from '@core/domain/entity';

interface UserProps extends EntityProps {
  name: string;
  email: Email;
  passwordHash: string;
  status: UserStatus;
  code: string | null;
}

interface CreateUserProps extends Omit<
  UserProps,
  'id' | 'createdAt' | 'updatedAt' | 'status' | 'platformRole' | 'passwordHash'
> {
  password: string;
}

export class User extends Entity<UserProps> {
  private constructor(props: UserProps) {
    super(props);
  }

  // --------------- Factory Methods ---------------

  static create(params: CreateUserProps): User {
    const now = new Date();
    const user = new User({
      ...params,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      status: UserStatus.ACTIVE,
      passwordHash: params.password, // TODO: implement hash
    });
    return user;
  }

  static rehydrate(params: UserProps): User {
    const user = new User(params);
    return user;
  }

  // --------------- Getters ---------------

  get name(): string {
    return this.props.name;
  }

  get email(): Email {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get status(): UserStatus {
    return this.props.status;
  }

  get code(): string | null {
    return this.props.code;
  }

  // --------------- Behaviours ---------------
  changeName(newName: string) {
    this.props.name = newName;
    this.touch();
  }

  changeEmail(newEmail: Email) {
    this.props.email = newEmail;
    this.touch();
  }

  changePasswordHash(newPasswordHash: string) {
    this.props.passwordHash = newPasswordHash;
    this.touch();
  }

  deactivate() {
    this.props.status = UserStatus.INACTIVE;
    this.touch();
  }

  activate() {
    this.props.status = UserStatus.ACTIVE;
    this.touch();
  }

  changeCode(newCode: string) {
    this.props.code = newCode;
    this.touch();
  }

  // --------------- Internal Methods ---------------
  touch() {
    this.props.updatedAt = new Date();
  }
}
