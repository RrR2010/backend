import { CreateEntityProps, Entity, EntityBaseProps } from '@shared/base-entity'
import { Id } from '@shared/value-objects'

type IngredientProps = EntityBaseProps & {}

type CreateIngredientProps = CreateEntityProps<IngredientProps>

export class Ingredient extends Entity<IngredientProps> {
  protected constructor(props: IngredientProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateIngredientProps): Ingredient {
    const now = new Date()
    const ingredient = new Ingredient({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now
    })
    return ingredient
  }

  static rehydrate(props: IngredientProps): Ingredient {
    return new Ingredient(props)
  }
}
