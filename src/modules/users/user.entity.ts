import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'
import { UserScope } from '@users/user.types'

export type UserProps = AuditableProps &
  LockableProps & {
    id: Id
    scope: UserScope
  }

export type CreateUserProps = Omit<
  UserProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class User extends Lockable(Auditable(Base<UserProps>)) {
  protected constructor(props: UserProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateUserProps): User {
    const now = new Date()

    return new User({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,

      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: UserProps): User {
    return new User(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
  }

  get scope(): UserScope {
    return this._props.scope
  }
}
