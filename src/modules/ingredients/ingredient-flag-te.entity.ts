import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'

export type IngredientFlag_TEProps = AuditableProps &
  LockableProps & {
    id: Id
    tenantId: string
    ingredientId: string
    flagId: string
    flagValue: boolean
    notes: string | null
  }

export type CreateIngredientFlag_TEProps = Omit<
  IngredientFlag_TEProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class IngredientFlag_TE extends Lockable(
  Auditable(Base<IngredientFlag_TEProps>)
) {
  protected constructor(props: IngredientFlag_TEProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateIngredientFlag_TEProps): IngredientFlag_TE {
    // TODO: zod validate input
    const now = new Date()

    return new IngredientFlag_TE({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: IngredientFlag_TEProps): IngredientFlag_TE {
    return new IngredientFlag_TE(props)
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

  get flagId(): string {
    return this._props.flagId
  }

  get flagValue(): boolean {
    return this._props.flagValue
  }

  get notes(): string | null {
    return this._props.notes
  }

  // --------------- Behaviors ---------------

  changeFlagValue(flagValue: boolean): void {
    this.ensureActivated('IngredientFlag_TE')
    this._props.flagValue = flagValue
    this.touch()
  }

  changeNotes(notes: string | null): void {
    this.ensureActivated('IngredientFlag_TE')
    this._props.notes = notes
    this.touch()
  }

  // Locked entities cannot be reactivated — requires unlock first
  activate(): void {
    this.ensureActivated('IngredientFlag_TE')
    super.activate()
  }

  lock(): void {
    super.lock()
  }

  delete(): void {
    super.delete()
  }

  unlock(): void {
    super.unlock()
  }
}
