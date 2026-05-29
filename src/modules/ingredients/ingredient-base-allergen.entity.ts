import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import { AllergenRelationType } from '@prisma/client'

export type IngredientBaseAllergenProps = AuditableProps & {
  id: Id
  tenantId: string
  ingredientId: string
  baseAllergenId: string
  relationType: AllergenRelationType
}

export type CreateIngredientBaseAllergenProps = Omit<
  IngredientBaseAllergenProps,
  keyof AuditableProps | 'id'
>

export class IngredientBaseAllergen extends Auditable(
  Base<IngredientBaseAllergenProps>
) {
  protected constructor(props: IngredientBaseAllergenProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(
    props: CreateIngredientBaseAllergenProps
  ): IngredientBaseAllergen {
    // TODO: zod validate input
    const now = new Date()
    return new IngredientBaseAllergen({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now
    })
  }

  static rehydrate(props: IngredientBaseAllergenProps): IngredientBaseAllergen {
    return new IngredientBaseAllergen(props)
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

  get baseAllergenId(): string {
    return this._props.baseAllergenId
  }

  get relationType(): AllergenRelationType {
    return this._props.relationType
  }

  // --------------- Behaviors ---------------

  changeRelationType(relationType: AllergenRelationType): void {
    this._props.relationType = relationType
    this.touch()
  }
}
