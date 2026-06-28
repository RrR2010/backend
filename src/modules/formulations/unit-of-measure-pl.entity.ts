import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'
import { MeasurementType, MeasurementSystem } from '@prisma/client'

export type UnitOfMeasurePLProps = AuditableProps &
  LockableProps & {
    id: Id
    code: string
    symbol: string | null
    measurementType: MeasurementType
    measurementSystem: MeasurementSystem
    createdBy: string | null
    updatedBy: string | null
  }

export type CreateUnitOfMeasurePLProps = Omit<
  UnitOfMeasurePLProps,
  keyof AuditableProps | keyof LockableProps | 'id' | 'createdBy' | 'updatedBy'
>

export class UnitOfMeasure_PL extends Lockable(
  Auditable(Base<UnitOfMeasurePLProps>)
) {
  protected constructor(props: UnitOfMeasurePLProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateUnitOfMeasurePLProps): UnitOfMeasure_PL {
    const now = new Date()

    return new UnitOfMeasure_PL({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      createdBy: null,
      updatedBy: null,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: UnitOfMeasurePLProps): UnitOfMeasure_PL {
    return new UnitOfMeasure_PL(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
  }

  get code(): string {
    return this._props.code
  }

  get symbol(): string | null {
    return this._props.symbol
  }

  get measurementType(): MeasurementType {
    return this._props.measurementType
  }

  get measurementSystem(): MeasurementSystem {
    return this._props.measurementSystem
  }

  get createdBy(): string | null {
    return this._props.createdBy
  }

  get updatedBy(): string | null {
    return this._props.updatedBy
  }

  // --------------- Behaviors ---------------

  changeCode(code: string): void {
    this.ensureActivated('UnitOfMeasure_PL')
    this._props.code = code
    this.touch()
  }

  changeSymbol(symbol: string | null): void {
    this.ensureActivated('UnitOfMeasure_PL')
    this._props.symbol = symbol
    this.touch()
  }

  changeMeasurementType(measurementType: MeasurementType): void {
    this.ensureActivated('UnitOfMeasure_PL')
    this._props.measurementType = measurementType
    this.touch()
  }

  changeMeasurementSystem(measurementSystem: MeasurementSystem): void {
    this.ensureActivated('UnitOfMeasure_PL')
    this._props.measurementSystem = measurementSystem
    this.touch()
  }
}
