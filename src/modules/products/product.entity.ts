import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import { SystemState, Lockable, type LockableProps } from '@shared/behaviours/lockable'
import { ProductStatus } from '@prisma/client'

export type ProductProps = AuditableProps & LockableProps & {
  id: Id
  tenantId: string
  name: string
  code: string
  status: ProductStatus
  commercialName: string | null
  denomination: string | null
  productType: string | null
  notes: string | null
  barcodeGtin: string | null
  declaredWeight: number | null
  declaredVolume: number | null
  shelfLifeDays: number | null
  storageConditions: string | null
}

export type CreateProductProps = Omit<ProductProps, keyof AuditableProps | keyof LockableProps | 'id' | 'status'
  | 'commercialName' | 'denomination' | 'productType' | 'notes'
  | 'barcodeGtin' | 'declaredWeight' | 'declaredVolume' | 'shelfLifeDays' | 'storageConditions'
> & {
  status?: ProductStatus
  commercialName?: string | null
  denomination?: string | null
  productType?: string | null
  notes?: string | null
  barcodeGtin?: string | null
  declaredWeight?: number | null
  declaredVolume?: number | null
  shelfLifeDays?: number | null
  storageConditions?: string | null
}

export class Product extends Lockable(Auditable(Base<ProductProps>)) {
  protected constructor(props: ProductProps) {
    super(props)
  }

  static create(props: CreateProductProps): Product {
    const now = new Date()
    return new Product({
      ...props,
      id: Id.generate(),
      status: props.status ?? ProductStatus.DRAFT,
      commercialName: props.commercialName ?? null,
      denomination: props.denomination ?? null,
      productType: props.productType ?? null,
      notes: props.notes ?? null,
      barcodeGtin: props.barcodeGtin ?? null,
      declaredWeight: props.declaredWeight ?? null,
      declaredVolume: props.declaredVolume ?? null,
      shelfLifeDays: props.shelfLifeDays ?? null,
      storageConditions: props.storageConditions ?? null,
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE,
    })
  }

  static rehydrate(props: ProductProps): Product {
    return new Product(props)
  }

  get id(): Id { return this._props.id }
  get tenantId(): string { return this._props.tenantId }
  get name(): string { return this._props.name }
  get code(): string { return this._props.code }
  get status(): ProductStatus { return this._props.status }
  get commercialName(): string | null { return this._props.commercialName }
  get denomination(): string | null { return this._props.denomination }
  get productType(): string | null { return this._props.productType }
  get notes(): string | null { return this._props.notes }
  get barcodeGtin(): string | null { return this._props.barcodeGtin }
  get declaredWeight(): number | null { return this._props.declaredWeight }
  get declaredVolume(): number | null { return this._props.declaredVolume }
  get shelfLifeDays(): number | null { return this._props.shelfLifeDays }
  get storageConditions(): string | null { return this._props.storageConditions }

  changeName(name: string): void {
    this.ensureActivated('Product')
    this._props.name = name
    this.touch()
  }

  changeCode(code: string): void {
    this.ensureActivated('Product')
    this._props.code = code
    this.touch()
  }

  changeStatus(status: ProductStatus): void {
    this.ensureActivated('Product')
    this._props.status = status
    this.touch()
  }

  activate(): void {
    this.ensureActivated('Product')
    super.activate()
  }

  lock(): void { super.lock() }
  delete(): void { super.delete() }
}
