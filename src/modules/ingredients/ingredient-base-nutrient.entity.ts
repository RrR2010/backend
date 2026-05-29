import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'

export type IngredientBaseNutrientProps = AuditableProps & {
  id: Id
  tenantId: string
  ingredientId: string
  baseNutrientId: string
  value: number | null
}

export type CreateIngredientBaseNutrientProps = Omit<
  IngredientBaseNutrientProps,
  keyof AuditableProps | 'id'
>

export class IngredientBaseNutrient extends Auditable(
  Base<IngredientBaseNutrientProps>
) {
  protected constructor(props: IngredientBaseNutrientProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(
    props: CreateIngredientBaseNutrientProps
  ): IngredientBaseNutrient {
    // TODO: zod validate input
    const now = new Date()
    return new IngredientBaseNutrient({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now
    })
  }

  static rehydrate(props: IngredientBaseNutrientProps): IngredientBaseNutrient {
    return new IngredientBaseNutrient(props)
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

  get baseNutrientId(): string {
    return this._props.baseNutrientId
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
