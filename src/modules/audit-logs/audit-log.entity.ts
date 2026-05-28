import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'

export type AuditLogProps = AuditableProps & {
  id: Id
  userId: string | null
  tenantId: string | null
  entityName: string
  entityId: string
  ipAddress: string | null
  userAgent: string | null
  action: string
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
  description: string | null
}

export type CreateAuditLogProps = Omit<
  AuditLogProps,
  keyof AuditableProps | 'id'
>

export class AuditLog extends Auditable(Base<AuditLogProps>) {
  protected constructor(props: AuditLogProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateAuditLogProps): AuditLog {
    const now = new Date()
    return new AuditLog({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now
    })
  }

  static rehydrate(props: AuditLogProps): AuditLog {
    return new AuditLog(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
  }

  get userId(): string | null {
    return this._props.userId
  }

  get tenantId(): string | null {
    return this._props.tenantId
  }

  get entityName(): string {
    return this._props.entityName
  }

  get entityId(): string {
    return this._props.entityId
  }

  get ipAddress(): string | null {
    return this._props.ipAddress
  }

  get userAgent(): string | null {
    return this._props.userAgent
  }

  get action(): string {
    return this._props.action
  }

  get before(): Record<string, unknown> | null {
    return this._props.before
  }

  get after(): Record<string, unknown> | null {
    return this._props.after
  }

  get description(): string | null {
    return this._props.description
  }
}
