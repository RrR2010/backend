import { Id } from '@core/domain/id.vo';
import { Email } from '@core/domain/email.vo';
import { CreateEntityProps, Entity, EntityProps } from '@core/domain/entity';
import { SystemState } from '@core/domain/system-state.enum';
import {
  PlatformRole,
  PlatformRoleHelpers,
} from '@core/domain/platform-role.enum';

/**
 * User Entity
 *
 * Represents a user account at the platform level.
 * Contains platform-level roles (PlatformRole[]) that define global permissions.
 *
 * Canonical Vocabulary:
 * - platformRoles: PlatformRole[] (ADMIN, MEMBER) - global scope
 * - scope: platform (vs tenant for TenantRole)
 *
 * Multi-Role Semantics:
 * - Multiple PlatformRoles allowed per user
 * - PlatformRole.NONE is a DERIVED state when platformRoles array is empty
 * - Permissions resolved by UNION (additive)
 */

type UserProps = EntityProps & {
  platformRoles: PlatformRole[];
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
      platformRoles: props.platformRoles || PlatformRoleHelpers.getDefault(),
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
  get platformRoles(): PlatformRole[] {
    return this._props.platformRoles;
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

  // --------------- Role Helper Methods ---------------
  /**
   * Returns true if user has no platform roles (derived NONE state)
   */
  get isPlatformRoleNone(): boolean {
    return PlatformRoleHelpers.isNone(this._props.platformRoles);
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
