import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import { SessionRevokedError } from '@authentication/session.errors'

export type SessionProps = AuditableProps & {
  id: Id
  userId: string
  tenantId: string | null
  refreshTokenHash: string
  deviceInfo: string | null
  ipAddress: string | null
  expiresAt: Date
  revokedAt: Date | null
}

export type CreateSessionProps = Omit<
  SessionProps,
  'createdAt' | 'updatedAt' | 'id'
>

export class Session extends Auditable(Base<SessionProps>) {
  private constructor(props: SessionProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateSessionProps) {
    const now = new Date()
    return new Session({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now
    })
  }

  static rehydrate(props: SessionProps) {
    return new Session(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
  }

  // --------------- Getters ---------------

  get userId(): string {
    return this._props.userId
  }

  get tenantId(): string | null {
    return this._props.tenantId
  }

  get refreshTokenHash(): string {
    return this._props.refreshTokenHash
  }

  get deviceInfo(): string | null {
    return this._props.deviceInfo
  }

  get ipAddress(): string | null {
    return this._props.ipAddress
  }

  get expiresAt(): Date {
    return this._props.expiresAt
  }

  get revokedAt(): Date | null {
    return this._props.revokedAt
  }

  // --------------- Computed Properties ---------------

  get isExpired(): boolean {
    return this._props.expiresAt < new Date()
  }

  get isValid(): boolean {
    return this._props.revokedAt === null && !this.isExpired
  }

  // --------------- Behaviors ---------------

  revoke(): void {
    if (this._props.revokedAt !== null) {
      throw new SessionRevokedError(this.id.value)
    }
    this._props.revokedAt = new Date()
    this.touch()
  }

  updateRefreshTokenHash(refreshTokenHash: string): void {
    this._props.refreshTokenHash = refreshTokenHash
    this.touch()
  }
}
