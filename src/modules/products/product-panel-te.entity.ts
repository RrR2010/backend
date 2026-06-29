import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'
import { ProductPanelType } from '@prisma/client'

export type ProductPanel_TEProps = AuditableProps &
  LockableProps & {
    id: Id
    tenantId: string
    productId: string
    panelNumber: number
    type: ProductPanelType
    geometricFormatTypeId: string | null
    geometricFormatValues: Record<string, unknown> | null
  }

export type CreateProductPanel_TEProps = Omit<
  ProductPanel_TEProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class ProductPanel_TE extends Lockable(
  Auditable(Base<ProductPanel_TEProps>)
) {
  protected constructor(props: ProductPanel_TEProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateProductPanel_TEProps): ProductPanel_TE {
    const now = new Date()
    return new ProductPanel_TE({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: ProductPanel_TEProps): ProductPanel_TE {
    return new ProductPanel_TE(props)
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

  get panelNumber(): number {
    return this._props.panelNumber
  }

  get type(): ProductPanelType {
    return this._props.type
  }

  get geometricFormatTypeId(): string | null {
    return this._props.geometricFormatTypeId
  }

  get geometricFormatValues(): Record<string, unknown> | null {
    return this._props.geometricFormatValues
  }

  // --------------- Behaviors ---------------

  changePanelNumber(panelNumber: number): void {
    this.ensureActivated('ProductPanel_TE')
    this._props.panelNumber = panelNumber
    this.touch()
  }

  changeType(productPanelType: ProductPanelType): void {
    this.ensureActivated('ProductPanel_TE')
    this._props.type = productPanelType
    this.touch()
  }

  changeGeometricFormatTypeId(geometricFormatTypeId: string | null): void {
    this.ensureActivated('ProductPanel_TE')
    this._props.geometricFormatTypeId = geometricFormatTypeId
    this.touch()
  }

  changeGeometricFormatValues(
    geometricFormatValues: Record<string, unknown> | null
  ): void {
    this.ensureActivated('ProductPanel_TE')
    this._props.geometricFormatValues = geometricFormatValues
    this.touch()
  }

  activate(): void {
    this.ensureActivated('ProductPanel_TE')
    super.activate()
  }

  lock(): void {
    super.lock()
  }

  delete(): void {
    super.delete()
  }
}
