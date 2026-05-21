import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'

export type IngredientNutrientProps = AuditableProps & {
  id: Id
  tenantId: string
  ingredientId: string
  nutrientId: string
  value: number | null
}

export type CreateIngredientNutrientProps = Omit<IngredientNutrientProps, keyof AuditableProps | 'id'>

export class IngredientNutrient extends Auditable(Base<IngredientNutrientProps>) {
  protected constructor(props: IngredientNutrientProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateIngredientNutrientProps): IngredientNutrient {
    // TODO: zod validate input
    const now = new Date()
    return new IngredientNutrient({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now
    })
  }

  static rehydrate(props: IngredientNutrientProps): IngredientNutrient {
    return new IngredientNutrient(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
  }

  get tenantId(): string {
    return this._props.tenantId
  }

  get ingredientId(): string {
    return this._props.ingredientId
  }

  get nutrientId(): string {
    return this._props.nutrientId
  }

  get value(): number | null {
    return this._props.value
  }

  // --------------- Behaviors ---------------

  changeValue(value: number | null): void {
    this._props.value = value
    this.touch()
  }
}
