import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'

export type BaseAllergenProps = AuditableProps &
  LockableProps & {
    id: Id
    name: string
    category: string | null
    regulatoryRef: string | null
    sortOrder: number
  }

export type CreateBaseAllergenProps = Omit<
  BaseAllergenProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class BaseAllergen extends Lockable(Auditable(Base<BaseAllergenProps>)) {
  protected constructor(props: BaseAllergenProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateBaseAllergenProps): BaseAllergen {
    const now = new Date()

    return new BaseAllergen({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: BaseAllergenProps): BaseAllergen {
    return new BaseAllergen(props)
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

  // --------------- Behaviors ---------------

  changeName(name: string): void {
    this.ensureActivated('BaseAllergen')
    this._props.name = name
    this.touch()
  }

  changeCategory(category: string | null): void {
    this.ensureActivated('BaseAllergen')
    this._props.category = category
    this.touch()
  }

  changeRegulatoryRef(regulatoryRef: string | null): void {
    this.ensureActivated('BaseAllergen')
    this._props.regulatoryRef = regulatoryRef
    this.touch()
  }

  changeSortOrder(sortOrder: number): void {
    this.ensureActivated('BaseAllergen')
    this._props.sortOrder = sortOrder
    this.touch()
  }
}
