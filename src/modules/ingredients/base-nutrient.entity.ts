import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'
import { NutrientUnit, NutrientCategory } from '@prisma/client'

export type BaseNutrientProps = AuditableProps &
  LockableProps & {
    id: Id
    name: string
    unit: NutrientUnit
    category: NutrientCategory
    sortOrder: number
  }

export type CreateBaseNutrientProps = Omit<
  BaseNutrientProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class BaseNutrient extends Lockable(Auditable(Base<BaseNutrientProps>)) {
  protected constructor(props: BaseNutrientProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateBaseNutrientProps): BaseNutrient {
    const now = new Date()

    return new BaseNutrient({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: BaseNutrientProps): BaseNutrient {
    return new BaseNutrient(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
  }

  get name(): string {
    return this._props.name
  }

  get unit(): NutrientUnit {
    return this._props.unit
  }

  get category(): NutrientCategory {
    return this._props.category
  }

  get sortOrder(): number {
    return this._props.sortOrder
  }

  // --------------- Behaviors ---------------

  changeName(name: string): void {
    this.ensureActivated('BaseNutrient')
    this._props.name = name
    this.touch()
  }

  changeUnit(unit: NutrientUnit): void {
    this.ensureActivated('BaseNutrient')
    this._props.unit = unit
    this.touch()
  }

  changeCategory(category: NutrientCategory): void {
    this.ensureActivated('BaseNutrient')
    this._props.category = category
    this.touch()
  }

  changeSortOrder(sortOrder: number): void {
    this.ensureActivated('BaseNutrient')
    this._props.sortOrder = sortOrder
    this.touch()
  }
}
