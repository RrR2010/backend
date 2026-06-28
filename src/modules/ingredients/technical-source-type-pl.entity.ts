import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'

export type TechnicalSourceTypePLProps = AuditableProps &
  LockableProps & {
    id: Id
    code: string
    name: string
    description: string | null
  }

export type CreateTechnicalSourceTypePLProps = Omit<
  TechnicalSourceTypePLProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class TechnicalSourceType_PL extends Lockable(
  Auditable(Base<TechnicalSourceTypePLProps>)
) {
  protected constructor(props: TechnicalSourceTypePLProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateTechnicalSourceTypePLProps): TechnicalSourceType_PL {
    const now = new Date()

    return new TechnicalSourceType_PL({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: TechnicalSourceTypePLProps): TechnicalSourceType_PL {
    return new TechnicalSourceType_PL(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
  }

  get code(): string {
    return this._props.code
  }

  get name(): string {
    return this._props.name
  }

  get description(): string | null {
    return this._props.description
  }

  // --------------- Behaviors ---------------

  changeCode(code: string): void {
    this.ensureActivated('TechnicalSourceType_PL')
    this._props.code = code
    this.touch()
  }

  changeName(name: string): void {
    this.ensureActivated('TechnicalSourceType_PL')
    this._props.name = name
    this.touch()
  }

  changeDescription(description: string | null): void {
    this.ensureActivated('TechnicalSourceType_PL')
    this._props.description = description
    this.touch()
  }
}
