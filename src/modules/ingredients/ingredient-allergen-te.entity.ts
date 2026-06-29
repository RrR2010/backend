import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import { AllergenRelationType } from '@prisma/client'

export type IngredientAllergen_TEProps = AuditableProps & {
  id: Id
  tenantId: string
  ingredientId: string
  allergenId: string
  relationType: AllergenRelationType
}

export type CreateIngredientAllergen_TEProps = Omit<
  IngredientAllergen_TEProps,
  keyof AuditableProps | 'id' | 'tenantId'
> & { tenantId?: string }

export class IngredientAllergen_TE extends Auditable(
  Base<IngredientAllergen_TEProps>
) {
  protected constructor(props: IngredientAllergen_TEProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateIngredientAllergen_TEProps): IngredientAllergen_TE {
    const now = new Date()
    return new IngredientAllergen_TE({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      tenantId: props.tenantId!
    })
  }

  static rehydrate(props: IngredientAllergen_TEProps): IngredientAllergen_TE {
    return new IngredientAllergen_TE(props)
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
