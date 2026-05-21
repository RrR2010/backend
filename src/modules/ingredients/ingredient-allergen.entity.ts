import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import { AllergenRelationType } from '@prisma/client'

export type IngredientAllergenProps = AuditableProps & {
  id: Id
  tenantId: string
  ingredientId: string
  allergenId: string
  relationType: AllergenRelationType
}

export type CreateIngredientAllergenProps = Omit<IngredientAllergenProps, keyof AuditableProps | 'id'>

export class IngredientAllergen extends Auditable(Base<IngredientAllergenProps>) {
  protected constructor(props: IngredientAllergenProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateIngredientAllergenProps): IngredientAllergen {
    // TODO: zod validate input
    const now = new Date()
    return new IngredientAllergen({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now
    })
  }

  static rehydrate(props: IngredientAllergenProps): IngredientAllergen {
    return new IngredientAllergen(props)
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

  get allergenId(): string {
    return this._props.allergenId
  }

  get relationType(): AllergenRelationType {
    return this._props.relationType
  }
}
