import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import { NutrientUnit, NutrientCategory } from '@prisma/client'

export type BaseNutrientProps = AuditableProps & {
  id: Id
  name: string
  unit: NutrientUnit
  category: NutrientCategory
  subcategory: string | null
  sortOrder: number
}

export type CreateBaseNutrientProps = Omit<
  BaseNutrientProps,
  keyof AuditableProps | 'id'
>

export class BaseNutrient extends Auditable(Base<BaseNutrientProps>) {
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
      updatedAt: now
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

  get subcategory(): string | null {
    return this._props.subcategory
  }

  get sortOrder(): number {
    return this._props.sortOrder
  }

  // --------------- Behaviors ---------------

  changeName(name: string): void {
    this._props.name = name
    this.touch()
  }

  changeUnit(unit: NutrientUnit): void {
    this._props.unit = unit
    this.touch()
  }

  changeCategory(category: NutrientCategory): void {
    this._props.category = category
    this.touch()
  }

  changeSubcategory(subcategory: string | null): void {
    this._props.subcategory = subcategory
    this.touch()
  }

  changeSortOrder(sortOrder: number): void {
    this._props.sortOrder = sortOrder
    this.touch()
  }
}
