import { AuthProviderType } from '@authentication/authentication.types'
import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'

export type IdentityProps = AuditableProps &
  LockableProps & {
    id: Id
    userId: string
    authProviderType: AuthProviderType
    identifier: string
    secretHash: string | null
  }

type CreateIdentityProps = Omit<
  IdentityProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class Identity extends Lockable(Auditable(Base<IdentityProps>)) {
  protected constructor(props: IdentityProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateIdentityProps): Identity {
    const now = new Date()
    const identity = new Identity({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
    return identity
  }

  static rehydrate(props: IdentityProps): Identity {
    return new Identity(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
  }

  get userId(): string {
    return this._props.userId
  }

  get authProviderType(): AuthProviderType {
    return this._props.authProviderType
  }

  get identifier(): string {
    return this._props.identifier
  }

  get secretHash(): string | null {
    return this._props.secretHash
  }

  // --------------- Behaviours ---------------

  changeIdentifier(newIdentifier: string): void {
    this.ensureActivated('Identity')
    this._props.identifier = newIdentifier
    this.touch()
  }

  changeSecretHash(newSecretHash: string): void {
    this.ensureActivated('Identity')
    this._props.secretHash = newSecretHash
    this.touch()
  }

  activate(): void {
    super.activate()
  }

  lock(): void {
    super.lock()
  }

  delete(): void {
    super.delete()
  }
}
