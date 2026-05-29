import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import { AllergenRelationType } from '@prisma/client'

export type IngredientTenantAllergenProps = AuditableProps & {
  id: Id
  tenantId: string
  ingredientId: string
  allergenId: string
  relationType: AllergenRelationType
}

export type CreateIngredientTenantAllergenProps = Omit<
  IngredientTenantAllergenProps,
  keyof AuditableProps | 'id'
>

export class IngredientTenantAllergen extends Auditable(
  Base<IngredientTenantAllergenProps>
) {
  protected constructor(props: IngredientTenantAllergenProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(
    props: CreateIngredientTenantAllergenProps
  ): IngredientTenantAllergen {
    // TODO: zod validate input
    const now = new Date()
    return new IngredientTenantAllergen({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now
    })
  }

  static rehydrate(
    props: IngredientTenantAllergenProps
  ): IngredientTenantAllergen {
    return new IngredientTenantAllergen(props)
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
