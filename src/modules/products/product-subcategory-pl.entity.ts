import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'

export type ProductSubcategoryPLProps = AuditableProps &
  LockableProps & {
    id: Id
    categoryId: string
    code: string
    name: string
    sequentialNumber: number
  }

export type CreateProductSubcategoryPLProps = Omit<
  ProductSubcategoryPLProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class ProductSubcategory_PL extends Lockable(
  Auditable(Base<ProductSubcategoryPLProps>)
) {
  protected constructor(props: ProductSubcategoryPLProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(
    props: CreateProductSubcategoryPLProps
  ): ProductSubcategory_PL {
    const now = new Date()

    return new ProductSubcategory_PL({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(
    props: ProductSubcategoryPLProps
  ): ProductSubcategory_PL {
    return new ProductSubcategory_PL(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
  }

  get categoryId(): string {
    return this._props.categoryId
  }

  get code(): string {
    return this._props.code
  }

  get name(): string {
    return this._props.name
  }

  get sequentialNumber(): number {
    return this._props.sequentialNumber
  }

  // --------------- Behaviors ---------------

  changeCategoryId(categoryId: string): void {
    this.ensureActivated('ProductSubcategory_PL')
    this._props.categoryId = categoryId
    this.touch()
  }

  changeCode(code: string): void {
    this.ensureActivated('ProductSubcategory_PL')
    this._props.code = code
    this.touch()
  }

  changeName(name: string): void {
    this.ensureActivated('ProductSubcategory_PL')
    this._props.name = name
    this.touch()
  }

  changeSequentialNumber(sequentialNumber: number): void {
    this.ensureActivated('ProductSubcategory_PL')
    this._props.sequentialNumber = sequentialNumber
    this.touch()
  }
}
