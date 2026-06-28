import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'

export type CommercialLine_TEProps = AuditableProps &
  LockableProps & {
    id: Id
    tenantId: string
    name: string
    description: string | null
  }

export type CreateCommercialLine_TEProps = Omit<
  CommercialLine_TEProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class CommercialLine_TE extends Lockable(
  Auditable(Base<CommercialLine_TEProps>)
) {
  protected constructor(props: CommercialLine_TEProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateCommercialLine_TEProps): CommercialLine_TE {
    // TODO: zod validate input
    const now = new Date()

    return new CommercialLine_TE({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: CommercialLine_TEProps): CommercialLine_TE {
    return new CommercialLine_TE(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
  }

  get tenantId(): string {
    return this._props.tenantId
  }

  get name(): string {
    return this._props.name
  }

  get description(): string | null {
    return this._props.description
  }

  // --------------- Behaviors ---------------

  changeName(name: string): void {
    this.ensureActivated('CommercialLine_TE')
    this._props.name = name
    this.touch()
  }

  changeDescription(description: string | null): void {
    this.ensureActivated('CommercialLine_TE')
    this._props.description = description
    this.touch()
  }
}
