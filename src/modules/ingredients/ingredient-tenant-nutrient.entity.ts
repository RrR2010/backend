import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'

export type IngredientTenantNutrientProps = AuditableProps & {
  id: Id
  tenantId: string
  ingredientId: string
  nutrientId: string
  value: number | null
}

export type CreateIngredientTenantNutrientProps = Omit<
  IngredientTenantNutrientProps,
  keyof AuditableProps | 'id'
>

export class IngredientTenantNutrient extends Auditable(
  Base<IngredientTenantNutrientProps>
) {
  protected constructor(props: IngredientTenantNutrientProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(
    props: CreateIngredientTenantNutrientProps
  ): IngredientTenantNutrient {
    // TODO: zod validate input
    const now = new Date()
    return new IngredientTenantNutrient({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now
    })
  }

  static rehydrate(
    props: IngredientTenantNutrientProps
  ): IngredientTenantNutrient {
    return new IngredientTenantNutrient(props)
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
