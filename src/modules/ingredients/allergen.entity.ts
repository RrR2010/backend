import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import { SystemState, Lockable, type LockableProps } from '@shared/behaviours/lockable'


export type AllergenProps = AuditableProps & LockableProps & {
  id: Id
  tenantId: string
  name: string
  category: string | null
  regulatoryRef: string | null
  sortOrder: number
  isActive: boolean
}

export type CreateAllergenProps = Omit<AllergenProps, keyof AuditableProps | keyof LockableProps | 'id'>

export class Allergen extends Lockable(Auditable(Base<AllergenProps>)) {
  protected constructor(props: AllergenProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateAllergenProps): Allergen {
    // TODO: zod validate input
    const now = new Date()

    return new Allergen({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: AllergenProps): Allergen {
    return new Allergen(props)
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

  get category(): string | null {
    return this._props.category
  }

  get regulatoryRef(): string | null {
    return this._props.regulatoryRef
  }

  get sortOrder(): number {
    return this._props.sortOrder
  }

  get isActive(): boolean {
    return this._props.isActive
  }

  // --------------- Behaviors ---------------

  changeName(name: string): void {
    this.ensureActivated('Allergen')
    this._props.name = name
    this.touch()
  }

  changeCategory(category: string | null): void {
    this.ensureActivated('Allergen')
    this._props.category = category
    this.touch()
  }

  changeRegulatoryRef(regulatoryRef: string | null): void {
    this.ensureActivated('Allergen')
    this._props.regulatoryRef = regulatoryRef
    this.touch()
  }

  changeSortOrder(sortOrder: number): void {
    this.ensureActivated('Allergen')
    this._props.sortOrder = sortOrder
    this.touch()
  }

  toggleActive(): void {
    this.ensureActivated('Allergen')
    this._props.isActive = !this._props.isActive
    this.touch()
  }

  setActive(): void {
    this.ensureActivated('Allergen')
    if (this._props.isActive) return
    this._props.isActive = true
    this.touch()
  }

  setInactive(): void {
    this.ensureActivated('Allergen')
    if (!this._props.isActive) return
    this._props.isActive = false
    this.touch()
  }

  // Dual-activation design: systemState (Lockable) controls visibility,
  // isActive (domain field) controls business availability.
  // Both are kept in sync: activate/lock/delete update both fields.
  // Locked entities cannot be reactivated — requires unlock first.
  activate(): void {
    this.ensureActivated('Allergen')
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
