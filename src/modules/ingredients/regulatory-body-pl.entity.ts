import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'

export type RegulatoryBodyPLProps = AuditableProps &
  LockableProps & {
    id: Id
    abbreviation: string | null
    code: string
    name: string
    description: string | null
  }

export type CreateRegulatoryBodyPLProps = Omit<
  RegulatoryBodyPLProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class RegulatoryBody_PL extends Lockable(
  Auditable(Base<RegulatoryBodyPLProps>)
) {
  protected constructor(props: RegulatoryBodyPLProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateRegulatoryBodyPLProps): RegulatoryBody_PL {
    const now = new Date()

    return new RegulatoryBody_PL({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: RegulatoryBodyPLProps): RegulatoryBody_PL {
    return new RegulatoryBody_PL(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
  }

  get abbreviation(): string | null {
    return this._props.abbreviation
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
    this.ensureActivated('RegulatoryBody_PL')
    this._props.code = code
    this.touch()
  }

  changeName(name: string): void {
    this.ensureActivated('RegulatoryBody_PL')
    this._props.name = name
    this.touch()
  }

  changeAbbreviation(abbreviation: string | null): void {
    this.ensureActivated('RegulatoryBody_PL')
    this._props.abbreviation = abbreviation
    this.touch()
  }

  changeDescription(description: string | null): void {
    this.ensureActivated('RegulatoryBody_PL')
    this._props.description = description
    this.touch()
  }
}
