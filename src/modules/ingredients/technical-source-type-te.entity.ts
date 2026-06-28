import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'

export type TechnicalSourceType_TEProps = AuditableProps &
  LockableProps & {
    id: Id
    tenantId: string
    name: string
    description: string | null
  }

export type CreateTechnicalSourceType_TEProps = Omit<
  TechnicalSourceType_TEProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class TechnicalSourceType_TE extends Lockable(
  Auditable(Base<TechnicalSourceType_TEProps>)
) {
  protected constructor(props: TechnicalSourceType_TEProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateTechnicalSourceType_TEProps): TechnicalSourceType_TE {
    // TODO: zod validate input
    const now = new Date()

    return new TechnicalSourceType_TE({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: TechnicalSourceType_TEProps): TechnicalSourceType_TE {
    return new TechnicalSourceType_TE(props)
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
    this.ensureActivated('TechnicalSourceType_TE')
    this._props.name = name
    this.touch()
  }

  changeDescription(description: string | null): void {
    this.ensureActivated('TechnicalSourceType_TE')
    this._props.description = description
    this.touch()
  }
}
