import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'

export type IngredientNutrient_TEProps = AuditableProps & {
  id: Id
  tenantId: string
  ingredientId: string
  nutrientId: string
  value: number | null
  sourceId: string | null
}

export type CreateIngredientNutrient_TEProps = Omit<
  IngredientNutrient_TEProps,
  keyof AuditableProps | 'id' | 'tenantId'
> & { tenantId?: string }

export class IngredientNutrient_TE extends Auditable(
  Base<IngredientNutrient_TEProps>
) {
  protected constructor(props: IngredientNutrient_TEProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(
    props: CreateIngredientNutrient_TEProps
  ): IngredientNutrient_TE {
    // TODO: zod validate input
    const now = new Date()
    return new IngredientNutrient_TE({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      tenantId: props.tenantId!
    })
  }

  static rehydrate(
    props: IngredientNutrient_TEProps
  ): IngredientNutrient_TE {
    return new IngredientNutrient_TE(props)
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

  get sourceId(): string | null {
    return this._props.sourceId
  }

  // --------------- Behaviors ---------------

  changeValue(value: number | null): void {
    this._props.value = value
    this.touch()
  }

  changeSourceId(sourceId: string | null): void {
    this._props.sourceId = sourceId
    this.touch()
  }
}
