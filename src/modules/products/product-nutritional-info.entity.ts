import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'

export type ProductNutritionalInfoProps = AuditableProps & {
  id: Id
  productId: string
  servingSize: number | null
  data: Record<string, unknown> | null
}

export type CreateProductNutritionalInfoProps = Omit<ProductNutritionalInfoProps, keyof AuditableProps | 'id'>

export class ProductNutritionalInfo extends Auditable(Base<ProductNutritionalInfoProps>) {
  protected constructor(props: ProductNutritionalInfoProps) {
    super(props)
  }

  static create(props: CreateProductNutritionalInfoProps): ProductNutritionalInfo {
    // TODO: zod validate input
    const now = new Date()
    return new ProductNutritionalInfo({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
    })
  }

  static rehydrate(props: ProductNutritionalInfoProps): ProductNutritionalInfo {
    return new ProductNutritionalInfo(props)
  }

  get id(): Id { return this._props.id }
  get productId(): string { return this._props.productId }
  get servingSize(): number | null { return this._props.servingSize }
  get data(): Record<string, unknown> | null { return this._props.data }

  updateServingSize(servingSize: number | null): void {
    this._props.servingSize = servingSize
    this.touch()
  }

  updateData(data: Record<string, unknown> | null): void {
    this._props.data = data
    this.touch()
  }
}
