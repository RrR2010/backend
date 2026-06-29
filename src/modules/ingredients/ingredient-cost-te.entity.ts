import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'

export type IngredientCost_TEProps = AuditableProps &
  LockableProps & {
    id: Id
    tenantId: string
    ingredientId: string
    unitPrice: number
    currencyCode: string
    unitOfMeasureId: string
    effectiveDate: Date
    supplierId: string | null
    notes: string | null
  }

export type CreateIngredientCost_TEProps = Omit<
  IngredientCost_TEProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class IngredientCost_TE extends Lockable(
  Auditable(Base<IngredientCost_TEProps>)
) {
  protected constructor(props: IngredientCost_TEProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateIngredientCost_TEProps): IngredientCost_TE {
    // TODO: zod validate input
    const now = new Date()

    return new IngredientCost_TE({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: IngredientCost_TEProps): IngredientCost_TE {
    return new IngredientCost_TE(props)
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

  get unitPrice(): number {
    return this._props.unitPrice
  }

  get currencyCode(): string {
    return this._props.currencyCode
  }

  get unitOfMeasureId(): string {
    return this._props.unitOfMeasureId
  }

  get effectiveDate(): Date {
    return this._props.effectiveDate
  }

  get supplierId(): string | null {
    return this._props.supplierId
  }

  get notes(): string | null {
    return this._props.notes
  }

  // --------------- Behaviors ---------------

  changeUnitPrice(unitPrice: number): void {
    this.ensureActivated('IngredientCost_TE')
    this._props.unitPrice = unitPrice
    this.touch()
  }

  changeCurrencyCode(currencyCode: string): void {
    this.ensureActivated('IngredientCost_TE')
    this._props.currencyCode = currencyCode
    this.touch()
  }

  changeUnitOfMeasureId(unitOfMeasureId: string): void {
    this.ensureActivated('IngredientCost_TE')
    this._props.unitOfMeasureId = unitOfMeasureId
    this.touch()
  }

  changeEffectiveDate(effectiveDate: Date): void {
    this.ensureActivated('IngredientCost_TE')
    this._props.effectiveDate = effectiveDate
    this.touch()
  }

  changeSupplierId(supplierId: string | null): void {
    this.ensureActivated('IngredientCost_TE')
    this._props.supplierId = supplierId
    this.touch()
  }

  changeNotes(notes: string | null): void {
    this.ensureActivated('IngredientCost_TE')
    this._props.notes = notes
    this.touch()
  }

  // Locked entities cannot be reactivated — requires unlock first
  activate(): void {
    this.ensureActivated('IngredientCost_TE')
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
