import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import { SystemState, Lockable, type LockableProps } from '@shared/behaviours/lockable'

export type IngredientLabelingProfileProps = AuditableProps & LockableProps & {
  id: Id
  tenantId: string
  ingredientId: string
  containsAddedSugars: boolean
  containsIngredientWithAddedSugars: boolean
  containsNaturallyOccurringSugarSubstitutes: boolean
  usesProcessingThatIncreasesSugars: boolean
  containsAddedFatsOrOils: boolean
  containsButterOrMargarine: boolean
  containsDairyCream: boolean
  containsIngredientsWithFatsOrCream: boolean
}

export type CreateIngredientLabelingProfileProps = Omit<IngredientLabelingProfileProps, keyof AuditableProps | keyof LockableProps | 'id'>

export class IngredientLabelingProfile extends Lockable(Auditable(Base<IngredientLabelingProfileProps>)) {
  protected constructor(props: IngredientLabelingProfileProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateIngredientLabelingProfileProps): IngredientLabelingProfile {
    // TODO: zod validate input
    const now = new Date()
    return new IngredientLabelingProfile({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: IngredientLabelingProfileProps): IngredientLabelingProfile {
    return new IngredientLabelingProfile(props)
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

  get containsAddedSugars(): boolean {
    return this._props.containsAddedSugars
  }

  get containsIngredientWithAddedSugars(): boolean {
    return this._props.containsIngredientWithAddedSugars
  }

  get containsNaturallyOccurringSugarSubstitutes(): boolean {
    return this._props.containsNaturallyOccurringSugarSubstitutes
  }

  get usesProcessingThatIncreasesSugars(): boolean {
    return this._props.usesProcessingThatIncreasesSugars
  }

  get containsAddedFatsOrOils(): boolean {
    return this._props.containsAddedFatsOrOils
  }

  get containsButterOrMargarine(): boolean {
    return this._props.containsButterOrMargarine
  }

  get containsDairyCream(): boolean {
    return this._props.containsDairyCream
  }

  get containsIngredientsWithFatsOrCream(): boolean {
    return this._props.containsIngredientsWithFatsOrCream
  }

  // --------------- Behaviors ---------------

  changeContainsAddedSugars(containsAddedSugars: boolean): void {
    this.ensureActivated('IngredientLabelingProfile')
    this._props.containsAddedSugars = containsAddedSugars
    this.touch()
  }

  changeContainsIngredientWithAddedSugars(containsIngredientWithAddedSugars: boolean): void {
    this.ensureActivated('IngredientLabelingProfile')
    this._props.containsIngredientWithAddedSugars = containsIngredientWithAddedSugars
    this.touch()
  }

  changeContainsNaturallyOccurringSugarSubstitutes(containsNaturallyOccurringSugarSubstitutes: boolean): void {
    this.ensureActivated('IngredientLabelingProfile')
    this._props.containsNaturallyOccurringSugarSubstitutes = containsNaturallyOccurringSugarSubstitutes
    this.touch()
  }

  changeUsesProcessingThatIncreasesSugars(usesProcessingThatIncreasesSugars: boolean): void {
    this.ensureActivated('IngredientLabelingProfile')
    this._props.usesProcessingThatIncreasesSugars = usesProcessingThatIncreasesSugars
    this.touch()
  }

  changeContainsAddedFatsOrOils(containsAddedFatsOrOils: boolean): void {
    this.ensureActivated('IngredientLabelingProfile')
    this._props.containsAddedFatsOrOils = containsAddedFatsOrOils
    this.touch()
  }

  changeContainsButterOrMargarine(containsButterOrMargarine: boolean): void {
    this.ensureActivated('IngredientLabelingProfile')
    this._props.containsButterOrMargarine = containsButterOrMargarine
    this.touch()
  }

  changeContainsDairyCream(containsDairyCream: boolean): void {
    this.ensureActivated('IngredientLabelingProfile')
    this._props.containsDairyCream = containsDairyCream
    this.touch()
  }

  changeContainsIngredientsWithFatsOrCream(containsIngredientsWithFatsOrCream: boolean): void {
    this.ensureActivated('IngredientLabelingProfile')
    this._props.containsIngredientsWithFatsOrCream = containsIngredientsWithFatsOrCream
    this.touch()
  }
}
