import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import { SystemState, Lockable, type LockableProps } from '@shared/behaviours/lockable'
import { ProductStatus } from '@prisma/client'

export type Product_TEProps = AuditableProps & LockableProps & {
  id: Id
  tenantId: string
  internalName: string
  code: string
  externalCode: string | null
  displayName: string | null
  status: ProductStatus
  commercialName: string | null
  saleDenomination: string | null
  productType: string | null
  notes: string | null
  barcodeGtin: string | null
  packagingType: string | null
  batchCode: string | null
  shelfLifeDays: number | null
  storageConditions: string | null
  declaredWeight: number | null
  declaredVolume: number | null
  productFamilyId: string | null
  commercialLineId: string | null
}

export type CreateProduct_TEProps = Omit<Product_TEProps,
  keyof AuditableProps | keyof LockableProps | 'id' | 'status'
  | 'commercialName' | 'saleDenomination' | 'productType' | 'notes'
  | 'barcodeGtin' | 'externalCode' | 'displayName'
  | 'packagingType' | 'batchCode' | 'declaredWeight' | 'declaredVolume'
  | 'shelfLifeDays' | 'storageConditions' | 'productFamilyId' | 'commercialLineId'
> & {
  status?: ProductStatus
  commercialName?: string | null
  saleDenomination?: string | null
  productType?: string | null
  notes?: string | null
  barcodeGtin?: string | null
  externalCode?: string | null
  displayName?: string | null
  packagingType?: string | null
  batchCode?: string | null
  declaredWeight?: number | null
  declaredVolume?: number | null
  shelfLifeDays?: number | null
  storageConditions?: string | null
  productFamilyId?: string | null
  commercialLineId?: string | null
}

export class Product_TE extends Lockable(Auditable(Base<Product_TEProps>)) {
  protected constructor(props: Product_TEProps) {
    super(props)
  }

  static create(props: CreateProduct_TEProps): Product_TE {
    const now = new Date()
    return new Product_TE({
      ...props,
      id: Id.generate(),
      status: props.status ?? ProductStatus.DRAFT,
      commercialName: props.commercialName ?? null,
      saleDenomination: props.saleDenomination ?? null,
      productType: props.productType ?? null,
      notes: props.notes ?? null,
      barcodeGtin: props.barcodeGtin ?? null,
      externalCode: props.externalCode ?? null,
      displayName: props.displayName ?? null,
      packagingType: props.packagingType ?? null,
      batchCode: props.batchCode ?? null,
      declaredWeight: props.declaredWeight ?? null,
      declaredVolume: props.declaredVolume ?? null,
      shelfLifeDays: props.shelfLifeDays ?? null,
      storageConditions: props.storageConditions ?? null,
      productFamilyId: props.productFamilyId ?? null,
      commercialLineId: props.commercialLineId ?? null,
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE,
    })
  }

  static rehydrate(props: Product_TEProps): Product_TE {
    return new Product_TE(props)
  }

  get id(): Id { return this._props.id }
  get tenantId(): string { return this._props.tenantId }
  get internalName(): string { return this._props.internalName }
  get code(): string { return this._props.code }
  get externalCode(): string | null { return this._props.externalCode }
  get displayName(): string | null { return this._props.displayName }
  get status(): ProductStatus { return this._props.status }
  get commercialName(): string | null { return this._props.commercialName }
  get saleDenomination(): string | null { return this._props.saleDenomination }
  get productType(): string | null { return this._props.productType }
  get notes(): string | null { return this._props.notes }
  get barcodeGtin(): string | null { return this._props.barcodeGtin }
  get packagingType(): string | null { return this._props.packagingType }
  get batchCode(): string | null { return this._props.batchCode }
  get declaredWeight(): number | null { return this._props.declaredWeight }
  get declaredVolume(): number | null { return this._props.declaredVolume }
  get shelfLifeDays(): number | null { return this._props.shelfLifeDays }
  get storageConditions(): string | null { return this._props.storageConditions }
  get productFamilyId(): string | null { return this._props.productFamilyId }
  get commercialLineId(): string | null { return this._props.commercialLineId }

  changeInternalName(internalName: string): void {
    this.ensureActivated('Product_TE')
    this._props.internalName = internalName
    this.touch()
  }

  changeCode(code: string): void {
    this.ensureActivated('Product_TE')
    this._props.code = code
    this.touch()
  }

  changeExternalCode(externalCode: string | null): void {
    this.ensureActivated('Product_TE')
    this._props.externalCode = externalCode
    this.touch()
  }

  changeDisplayName(displayName: string | null): void {
    this.ensureActivated('Product_TE')
    this._props.displayName = displayName
    this.touch()
  }

  changeStatus(status: ProductStatus): void {
    this.ensureActivated('Product_TE')
    this._props.status = status
    this.touch()
  }

  changeCommercialName(commercialName: string | null): void {
    this.ensureActivated('Product_TE')
    this._props.commercialName = commercialName
    this.touch()
  }

  changeSaleDenomination(saleDenomination: string | null): void {
    this.ensureActivated('Product_TE')
    this._props.saleDenomination = saleDenomination
    this.touch()
  }

  changeNotes(notes: string | null): void {
    this.ensureActivated('Product_TE')
    this._props.notes = notes
    this.touch()
  }

  changeBarcodeGtin(barcodeGtin: string | null): void {
    this.ensureActivated('Product_TE')
    this._props.barcodeGtin = barcodeGtin
    this.touch()
  }

  changePackagingType(packagingType: string | null): void {
    this.ensureActivated('Product_TE')
    this._props.packagingType = packagingType
    this.touch()
  }

  changeBatchCode(batchCode: string | null): void {
    this.ensureActivated('Product_TE')
    this._props.batchCode = batchCode
    this.touch()
  }

  changeDeclaredWeight(declaredWeight: number | null): void {
    this.ensureActivated('Product_TE')
    this._props.declaredWeight = declaredWeight
    this.touch()
  }

  changeDeclaredVolume(declaredVolume: number | null): void {
    this.ensureActivated('Product_TE')
    this._props.declaredVolume = declaredVolume
    this.touch()
  }

  changeShelfLifeDays(shelfLifeDays: number | null): void {
    this.ensureActivated('Product_TE')
    this._props.shelfLifeDays = shelfLifeDays
    this.touch()
  }

  changeStorageConditions(storageConditions: string | null): void {
    this.ensureActivated('Product_TE')
    this._props.storageConditions = storageConditions
    this.touch()
  }

  changeProductFamilyId(productFamilyId: string | null): void {
    this.ensureActivated('Product_TE')
    this._props.productFamilyId = productFamilyId
    this.touch()
  }

  changeCommercialLineId(commercialLineId: string | null): void {
    this.ensureActivated('Product_TE')
    this._props.commercialLineId = commercialLineId
    this.touch()
  }

  activate(): void {
    this.ensureActivated('Product_TE')
    super.activate()
  }

  lock(): void { super.lock() }
  delete(): void { super.delete() }
}
