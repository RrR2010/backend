import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'

export type AllergenPLProps = AuditableProps &
  LockableProps & {
    id: Id
    name: string
    category: string | null
    regulatoryRef: string | null
    sortOrder: number
    createdBy: string | null
    updatedBy: string | null
  }

export type CreateAllergenPLProps = Omit<
  AllergenPLProps,
  keyof AuditableProps | keyof LockableProps | 'id' | 'createdBy' | 'updatedBy'
>

export class Allergen_PL extends Lockable(
  Auditable(Base<AllergenPLProps>)
) {
  protected constructor(props: AllergenPLProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateAllergenPLProps): Allergen_PL {
    const now = new Date()

    return new Allergen_PL({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      createdBy: null,
      updatedBy: null,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: AllergenPLProps): Allergen_PL {
    return new Allergen_PL(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
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

  get createdBy(): string | null {
    return this._props.createdBy
  }

  get updatedBy(): string | null {
    return this._props.updatedBy
  }

  // --------------- Behaviors ---------------

  changeName(name: string): void {
    this.ensureActivated('Allergen_PL')
    this._props.name = name
    this.touch()
  }

  changeCategory(category: string | null): void {
    this.ensureActivated('Allergen_PL')
    this._props.category = category
    this.touch()
  }

  changeRegulatoryRef(regulatoryRef: string | null): void {
    this.ensureActivated('Allergen_PL')
    this._props.regulatoryRef = regulatoryRef
    this.touch()
  }

  changeSortOrder(sortOrder: number): void {
    this.ensureActivated('Allergen_PL')
    this._props.sortOrder = sortOrder
    this.touch()
  }
}
