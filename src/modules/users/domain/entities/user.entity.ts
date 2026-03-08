import { Id } from '@core/domain/value-objects/id.vo';
import { UserRole } from '@modules/users/domain/enums/user-role.enum';
import { UserStatus } from '@modules/users/domain/enums/user-status.enum';
import { Email } from '@core/domain/value-objects/email.vo';
import { Entity, EntityProps } from '@core/domain/entities/entity';

interface UserProps extends EntityProps {
  name: string;
  email: Email;
  passwordHash: string;
  status: UserStatus;
  role: UserRole;
  code: string | null;
}

interface NewUserProps extends Omit<
  UserProps,
  'id' | 'createdAt' | 'updatedAt' | 'status' | 'role' | 'passwordHash'
> {
  password: string;
}

export class User extends Entity<UserProps> {
  private constructor(props: UserProps) {
    super(props);
  }

  // --------------- Factory Methods ---------------

  static create(params: NewUserProps): User {
    const now = new Date();
    const user = new User({
      ...params,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      status: UserStatus.ACTIVE,
      role: UserRole.MEMBER,
      passwordHash: params.password, // TODO: In a real app, hash this!
    });
    return user;
  }

  static rehydrate(props: UserProps): User {
    const user = new User({ ...props });
    return user;
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this.props.id;
  }

  get tenantId(): Id {
    return this.props.tenantId;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): Email {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get status(): UserStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
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

  promoteToAdmin() {
    this.props.role = UserRole.ADMIN;
    this.touch();
  }

  demoteToMember() {
    this.props.role = UserRole.MEMBER;
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
