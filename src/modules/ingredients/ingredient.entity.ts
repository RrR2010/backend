import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import { SystemState, Lockable, type LockableProps } from '@shared/behaviours/lockable'
import { IngredientFunctionType } from '@prisma/client'
import { EntityLockedError } from '@shared/errors/entity-state.errors'

export type IngredientProps = AuditableProps & LockableProps & {
  id: Id
  tenantId: string
  code: string
  functionalName: string
  commercialName: string | null
  saleName: string | null
  functionalGroupId: string | null
  ingredientFunction: IngredientFunctionType
  notes: string | null
  manufacturerId: string | null
  supplierId: string | null
  technicalSourceId: string | null
  usageIndication: string | null
  ingredientsListDesc: string | null
}

export type CreateIngredientProps = Omit<IngredientProps, keyof AuditableProps | keyof LockableProps | 'id'>

export class Ingredient extends Lockable(Auditable(Base<IngredientProps>)) {
  protected constructor(props: IngredientProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateIngredientProps): Ingredient {
    // TODO: zod validate input
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

  get tenantId(): string {
    return this._props.tenantId
  }

  get code(): string {
    return this._props.code
  }

  get functionalName(): string {
    return this._props.functionalName
  }

  get commercialName(): string | null {
    return this._props.commercialName
  }

  get saleName(): string | null {
    return this._props.saleName
  }

  get functionalGroupId(): string | null {
    return this._props.functionalGroupId
  }

  get ingredientFunction(): IngredientFunctionType {
    return this._props.ingredientFunction
  }

  get notes(): string | null {
    return this._props.notes
  }

  get manufacturerId(): string | null {
    return this._props.manufacturerId
  }

  get supplierId(): string | null {
    return this._props.supplierId
  }

  get technicalSourceId(): string | null {
    return this._props.technicalSourceId
  }

  get usageIndication(): string | null {
    return this._props.usageIndication
  }

  get ingredientsListDesc(): string | null {
    return this._props.ingredientsListDesc
  }

  // --------------- Behaviors ---------------

  changeCode(code: string): void {
    this.ensureActivated('Ingredient')
    this._props.code = code
    this.touch()
  }

  changeFunctionalName(functionalName: string): void {
    this.ensureActivated('Ingredient')
    this._props.functionalName = functionalName
    this.touch()
  }

  changeCommercialName(commercialName: string | null): void {
    this.ensureActivated('Ingredient')
    this._props.commercialName = commercialName
    this.touch()
  }

  changeSaleName(saleName: string | null): void {
    this.ensureActivated('Ingredient')
    this._props.saleName = saleName
    this.touch()
  }

  changeFunctionalGroup(functionalGroupId: string | null): void {
    this.ensureActivated('Ingredient')
    this._props.functionalGroupId = functionalGroupId
    this.touch()
  }

  changeIngredientFunction(ingredientFunction: IngredientFunctionType): void {
    this.ensureActivated('Ingredient')
    this._props.ingredientFunction = ingredientFunction
    this.touch()
  }

  changeNotes(notes: string | null): void {
    this.ensureActivated('Ingredient')
    this._props.notes = notes
    this.touch()
  }

  changeManufacturer(manufacturerId: string | null): void {
    this.ensureActivated('Ingredient')
    this._props.manufacturerId = manufacturerId
    this.touch()
  }

  changeSupplier(supplierId: string | null): void {
    this.ensureActivated('Ingredient')
    this._props.supplierId = supplierId
    this.touch()
  }

  changeTechnicalSource(technicalSourceId: string | null): void {
    this.ensureActivated('Ingredient')
    this._props.technicalSourceId = technicalSourceId
    this.touch()
  }

  changeUsageIndication(usageIndication: string | null): void {
    this.ensureActivated('Ingredient')
    this._props.usageIndication = usageIndication
    this.touch()
  }

  changeIngredientsListDesc(ingredientsListDesc: string | null): void {
    this.ensureActivated('Ingredient')
    this._props.ingredientsListDesc = ingredientsListDesc
    this.touch()
  }

  setInactive(): void {
    if (this._props.systemState === SystemState.HIDDEN) return
    this._props.systemState = SystemState.HIDDEN
    this.touch()
  }

  toggleActive(): void {
    if (this._props.systemState === SystemState.ACTIVE) {
      this.setInactive()
    } else if (this._props.systemState === SystemState.LOCKED) {
      // Locked entities cannot be toggled
      throw new EntityLockedError('Ingredient')
    } else {
      this.activate()
    }
  }

  // Ingredient uses systemState only (no separate isActive domain field).
  // activate/lock/delete manage systemState directly.
  // Locked entities cannot be reactivated — requires unlock first.
  activate(): void {
    this.ensureActivated('Ingredient')
    super.activate()
  }

  lock(): void {
    super.lock()
  }

  delete(): void {
    super.delete()
  }
}
