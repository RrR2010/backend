import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'

export type UnitConversionPLProps = AuditableProps &
  LockableProps & {
    id: Id
    fromUnitId: string
    toUnitId: string
    factor: number
    createdBy: string | null
    updatedBy: string | null
  }

export type CreateUnitConversionPLProps = Omit<
  UnitConversionPLProps,
  keyof AuditableProps | keyof LockableProps | 'id' | 'createdBy' | 'updatedBy'
>

export class UnitConversion_PL extends Lockable(
  Auditable(Base<UnitConversionPLProps>)
) {
  protected constructor(props: UnitConversionPLProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateUnitConversionPLProps): UnitConversion_PL {
    const now = new Date()

    return new UnitConversion_PL({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      createdBy: null,
      updatedBy: null,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: UnitConversionPLProps): UnitConversion_PL {
    return new UnitConversion_PL(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
  }

  get fromUnitId(): string {
    return this._props.fromUnitId
  }

  get toUnitId(): string {
    return this._props.toUnitId
  }

  get factor(): number {
    return this._props.factor
  }

  get createdBy(): string | null {
    return this._props.createdBy
  }

  get updatedBy(): string | null {
    return this._props.updatedBy
  }

  // --------------- Behaviors ---------------

  changeFactor(factor: number): void {
    this.ensureActivated('UnitConversion_PL')
    this._props.factor = factor
    this.touch()
  }
}
