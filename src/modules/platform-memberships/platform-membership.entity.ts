import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'
import { PlatformRole } from '@users/user.types'
import { PlatformMembershipLockedError } from '@platform-memberships/platform-membership.errors'

export type PlatformMembershipProps = AuditableProps &
  LockableProps & {
    id: Id
    userId: string
    roles: PlatformRole[]
  }

export type CreatePlatformMembershipProps = Omit<
  PlatformMembershipProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class PlatformMembership extends Lockable(
  Auditable(Base<PlatformMembershipProps>)
) {
  protected constructor(props: PlatformMembershipProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreatePlatformMembershipProps): PlatformMembership {
    const now = new Date()
    return new PlatformMembership({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: PlatformMembershipProps): PlatformMembership {
    return new PlatformMembership(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
  }

  get userId(): string {
    return this._props.userId
  }

  get roles(): PlatformRole[] {
    return this._props.roles
  }

  // --------------- Behaviours ---------------

  addRole(role: PlatformRole): void {
    this.ensureActivated('PlatformMembership')
    if (!this._props.roles.includes(role)) {
      this._props.roles.push(role)
      this.touch()
    }
  }

  removeRole(role: PlatformRole): void {
    this.ensureActivated('PlatformMembership')
    this._props.roles = this._props.roles.filter((r) => r !== role)
    this.touch()
  }
}
