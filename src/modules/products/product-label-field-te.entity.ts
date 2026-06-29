import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'

export type ProductLabelField_TEProps = AuditableProps & {
  id: Id
  tenantId: string
  productId: string
  labelFieldId: string
  designerValue: string | null
  gerencialValue: string | null
}

export type CreateProductLabelField_TEProps = Omit<
  ProductLabelField_TEProps,
  keyof AuditableProps | 'id'
>

export class ProductLabelField_TE extends Auditable(
  Base<ProductLabelField_TEProps>
) {
  protected constructor(props: ProductLabelField_TEProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateProductLabelField_TEProps): ProductLabelField_TE {
    const now = new Date()
    return new ProductLabelField_TE({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now
    })
  }

  static rehydrate(props: ProductLabelField_TEProps): ProductLabelField_TE {
    return new ProductLabelField_TE(props)
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

  get labelFieldId(): string {
    return this._props.labelFieldId
  }

  get designerValue(): string | null {
    return this._props.designerValue
  }

  get gerencialValue(): string | null {
    return this._props.gerencialValue
  }

  // --------------- Behaviors ---------------

  changeDesignerValue(designerValue: string | null): void {
    this._props.designerValue = designerValue
    this.touch()
  }

  changeGerencialValue(gerencialValue: string | null): void {
    this._props.gerencialValue = gerencialValue
    this.touch()
  }
}
