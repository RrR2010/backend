import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'

export type ProductNutrientOverride_TEProps = AuditableProps & {
  id: Id
  tenantId: string
  productId: string
  nutrientId: string
  overriddenValue: number
  notes: string | null
}

export type CreateProductNutrientOverride_TEProps = Omit<
  ProductNutrientOverride_TEProps,
  keyof AuditableProps | 'id'
>

export class ProductNutrientOverride_TE extends Auditable(
  Base<ProductNutrientOverride_TEProps>
) {
  protected constructor(props: ProductNutrientOverride_TEProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(
    props: CreateProductNutrientOverride_TEProps
  ): ProductNutrientOverride_TE {
    const now = new Date()
    return new ProductNutrientOverride_TE({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now
    })
  }

  static rehydrate(
    props: ProductNutrientOverride_TEProps
  ): ProductNutrientOverride_TE {
    return new ProductNutrientOverride_TE(props)
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

  get nutrientId(): string {
    return this._props.nutrientId
  }

  get overriddenValue(): number {
    return this._props.overriddenValue
  }

  get notes(): string | null {
    return this._props.notes
  }

  // --------------- Behaviors ---------------

  changeOverriddenValue(overriddenValue: number): void {
    this._props.overriddenValue = overriddenValue
    this.touch()
  }

  changeNotes(notes: string | null): void {
    this._props.notes = notes
    this.touch()
  }
}
