import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import { SystemState, Lockable, type LockableProps } from '@shared/behaviours/lockable'
import { NutrientUnit, NutrientCategory } from '@prisma/client'

export type NutrientProps = AuditableProps & LockableProps & {
  id: Id
  tenantId: string
  name: string
  unit: NutrientUnit
  category: NutrientCategory
  subcategory: string | null
  sortOrder: number
  isActive: boolean
}

export type CreateNutrientProps = Omit<NutrientProps, keyof AuditableProps | keyof LockableProps | 'id'>

export class Nutrient extends Lockable(Auditable(Base<NutrientProps>)) {
  protected constructor(props: NutrientProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateNutrientProps): Nutrient {
    // TODO: zod validate input
    const now = new Date()

    return new Nutrient({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: NutrientProps): Nutrient {
    return new Nutrient(props)
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

  get isActive(): boolean {
    return this._props.isActive
  }

  // --------------- Behaviors ---------------

  changeName(name: string): void {
    this.ensureActivated('Nutrient')
    this._props.name = name
    this.touch()
  }

  changeUnit(unit: NutrientUnit): void {
    this.ensureActivated('Nutrient')
    this._props.unit = unit
    this.touch()
  }

  changeCategory(category: NutrientCategory): void {
    this.ensureActivated('Nutrient')
    this._props.category = category
    this.touch()
  }

  changeSubcategory(subcategory: string | null): void {
    this.ensureActivated('Nutrient')
    this._props.subcategory = subcategory
    this.touch()
  }

  changeSortOrder(sortOrder: number): void {
    this.ensureActivated('Nutrient')
    this._props.sortOrder = sortOrder
    this.touch()
  }

  toggleActive(): void {
    this.ensureActivated('Nutrient')
    this._props.isActive = !this._props.isActive
    this.touch()
  }

  setActive(): void {
    this.ensureActivated('Nutrient')
    if (this._props.isActive) return
    this._props.isActive = true
    this.touch()
  }

  setInactive(): void {
    this.ensureActivated('Nutrient')
    if (!this._props.isActive) return
    this._props.isActive = false
    this.touch()
  }

  // Dual-activation design: systemState (Lockable) controls visibility,
  // isActive (domain field) controls business availability.
  // Both are kept in sync: activate/lock/delete update both fields.
  // Locked entities cannot be reactivated — requires unlock first.
  activate(): void {
    this.ensureActivated('Nutrient')
    this._props.isActive = true
    super.activate()
  }

  lock(): void {
    this._props.isActive = false
    super.lock()
  }

  delete(): void {
    this._props.isActive = false
    super.delete()
  }
}
