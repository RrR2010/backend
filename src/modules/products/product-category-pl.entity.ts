import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'

export type ProductCategoryPLProps = AuditableProps &
  LockableProps & {
    id: Id
    code: string
    name: string
    description: string | null
    sequentialNumber: number
  }

export type CreateProductCategoryPLProps = Omit<
  ProductCategoryPLProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class ProductCategory_PL extends Lockable(
  Auditable(Base<ProductCategoryPLProps>)
) {
  protected constructor(props: ProductCategoryPLProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateProductCategoryPLProps): ProductCategory_PL {
    const now = new Date()

    return new ProductCategory_PL({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: ProductCategoryPLProps): ProductCategory_PL {
    return new ProductCategory_PL(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
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

  get sequentialNumber(): number {
    return this._props.sequentialNumber
  }

  // --------------- Behaviors ---------------

  changeCode(code: string): void {
    this.ensureActivated('ProductCategory_PL')
    this._props.code = code
    this.touch()
  }

  changeName(name: string): void {
    this.ensureActivated('ProductCategory_PL')
    this._props.name = name
    this.touch()
  }

  changeDescription(description: string | null): void {
    this.ensureActivated('ProductCategory_PL')
    this._props.description = description
    this.touch()
  }

  changeSequentialNumber(sequentialNumber: number): void {
    this.ensureActivated('ProductCategory_PL')
    this._props.sequentialNumber = sequentialNumber
    this.touch()
  }
}
