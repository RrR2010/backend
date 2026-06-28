import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'

export type RegulationTypePLProps = AuditableProps &
  LockableProps & {
    id: Id
    abbreviation: string
    code: string
    name: string
    description: string | null
  }

export type CreateRegulationTypePLProps = Omit<
  RegulationTypePLProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class RegulationType_PL extends Lockable(
  Auditable(Base<RegulationTypePLProps>)
) {
  protected constructor(props: RegulationTypePLProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateRegulationTypePLProps): RegulationType_PL {
    const now = new Date()

    return new RegulationType_PL({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: RegulationTypePLProps): RegulationType_PL {
    return new RegulationType_PL(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
  }

  get abbreviation(): string {
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
    this.ensureActivated('RegulationType_PL')
    this._props.code = code
    this.touch()
  }

  changeName(name: string): void {
    this.ensureActivated('RegulationType_PL')
    this._props.name = name
    this.touch()
  }

  changeAbbreviation(abbreviation: string): void {
    this.ensureActivated('RegulationType_PL')
    this._props.abbreviation = abbreviation
    this.touch()
  }

  changeDescription(description: string | null): void {
    this.ensureActivated('RegulationType_PL')
    this._props.description = description
    this.touch()
  }
}
