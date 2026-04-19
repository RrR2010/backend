import { Id } from '@core/domain/id.vo';
import { Email } from '@core/domain/email.vo';
import { CreateEntityProps, Entity, EntityProps } from '@core/domain/entity';
import { SystemState } from '@core/domain/system-state.enum';
import { PlatformRole } from '@core/domain/platform-role.enum';

/**
 * User Entity
 *
 * Represents a user account at the platform level.
 * Contains platform-level role (PlatformRole) that defines global permissions.
 *
 * Canonical Vocabulary:
 * - platformRole: PlatformRole (ADMIN, MEMBER) - global scope
 * - scope: platform (vs tenant for TenantRole)
 */

type UserProps = EntityProps & {
  platformRole: PlatformRole;
  name: string;
  email: Email;
  passwordHash: string;
  code: string | null;
};

type CreateUserProps = CreateEntityProps<UserProps>;

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
      platformRole: props.platformRole,
      name: props.name,
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE,
      passwordHash: props.passwordHash,
    });
    return user;
  }

  static rehydrate(props: UserProps): User {
    return new User(props);
  }

  // --------------- Getters ---------------
  get platformRole(): PlatformRole {
    return this._props.platformRole;
  }

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
    this._touch();
  }

  changeEmail(newEmail: Email) {
    this._props.email = newEmail;
    this._touch();
  }

  changePasswordHash(newPasswordHash: string) {
    this._props.passwordHash = newPasswordHash;
    this._touch();
  }

  changeCode(newCode: string) {
    this._props.code = newCode;
    this._touch();
  }

  // --------------- Internal Methods ---------------
}
