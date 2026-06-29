import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'

export type ProductClaim_TEProps = AuditableProps &
  LockableProps & {
    id: Id
    tenantId: string
    productId: string
    claimId: string
    isActive: boolean
    sortOrder: number
  }

export type CreateProductClaim_TEProps = Omit<
  ProductClaim_TEProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class ProductClaim_TE extends Lockable(
  Auditable(Base<ProductClaim_TEProps>)
) {
  protected constructor(props: ProductClaim_TEProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateProductClaim_TEProps): ProductClaim_TE {
    const now = new Date()
    return new ProductClaim_TE({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: ProductClaim_TEProps): ProductClaim_TE {
    return new ProductClaim_TE(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
  }

  get tenantId(): string {
    return this._props.tenantId
  }

  get productId(): string {
    return this._props.productId
  }

  get claimId(): string {
    return this._props.claimId
  }

  get isActive(): boolean {
    return this._props.isActive
  }

  get sortOrder(): number {
    return this._props.sortOrder
  }

  // --------------- Behaviors ---------------

  changeIsActive(isActive: boolean): void {
    this.ensureActivated('ProductClaim_TE')
    this._props.isActive = isActive
    this.touch()
  }

  changeSortOrder(sortOrder: number): void {
    this.ensureActivated('ProductClaim_TE')
    this._props.sortOrder = sortOrder
    this.touch()
  }

  activate(): void {
    this.ensureActivated('ProductClaim_TE')
    super.activate()
  }

  lock(): void {
    super.lock()
  }

  delete(): void {
    super.delete()
  }
}
