import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import { SystemState, Lockable, type LockableProps } from '@shared/behaviours/lockable'

export type IngredientProps = AuditableProps &
  LockableProps & {
    id: Id
    name: string
    description: string | null
    tenantId: string | null
  }

export type CreateIngredientProps = Omit<
  IngredientProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class Ingredient extends Lockable(Auditable(Base<IngredientProps>)) {
  protected constructor(props: IngredientProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateIngredientProps): Ingredient {
    const now = new Date()
    return new Ingredient({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: IngredientProps): Ingredient {
    return new Ingredient(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
  }

  get name(): string {
    return this._props.name
  }

  get description(): string | null {
    return this._props.description
  }

  get tenantId(): string | null {
    return this._props.tenantId
  }
}