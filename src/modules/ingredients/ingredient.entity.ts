import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'
import { IngredientFunctionType, FlavorOriginType, ColorantOriginType } from '@prisma/client'
import { EntityLockedError } from '@shared/errors/entity-state.errors'

export type Ingredient_TEProps = AuditableProps &
  LockableProps & {
    id: Id
    tenantId: string
    code: string
    externalCode: string | null
    internalName: string
    commercialName: string | null
    saleDenomination: string | null
    functionalGroupId: string | null
    ingredientFunction: IngredientFunctionType
    notes: string | null
    manufacturerId: string | null
    supplierId: string | null
    technicalSourceId: string | null
    usageIndication: string | null
    ingredientsListDesc: string | null

    // === Regulatory Profile ===
    hasRtiqPiq: boolean
    gmoIngredient: string | null
    gmoDonorSpecies: string | null
    gmoPercentage: number | null
    irradiatedIngredient: string | null
    flavorOriginType: FlavorOriginType | null
    colorantOriginType: ColorantOriginType | null

    // === Labeling Profile (compositional flags) ===
    containsAddedSugars: boolean
    containsIngredientWithAddedSugars: boolean
    containsNaturallyOccurringSugarSubstitutes: boolean
    usesProcessingThatIncreasesSugars: boolean
    containsAddedFatsOrOils: boolean
    containsButterOrMargarine: boolean
    containsDairyCream: boolean
    containsIngredientsWithFatsOrCream: boolean

    // === Technical Profile ===
    pac: number | null
    pod: number | null
    totalSolids: number | null
    ashContent: number | null
  }

export type CreateIngredient_TEProps = Omit<
  Ingredient_TEProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class Ingredient_TE extends Lockable(Auditable(Base<Ingredient_TEProps>)) {
  protected constructor(props: Ingredient_TEProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateIngredient_TEProps): Ingredient_TE {
    // TODO: zod validate input
    const now = new Date()

    return new Ingredient_TE({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: Ingredient_TEProps): Ingredient_TE {
    return new Ingredient_TE(props)
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

  get externalCode(): string | null {
    return this._props.externalCode
  }

  get internalName(): string {
    return this._props.internalName
  }

  get commercialName(): string | null {
    return this._props.commercialName
  }

  get saleDenomination(): string | null {
    return this._props.saleDenomination
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

  // --------------- Regulatory Profile Getters ---------------

  get hasRtiqPiq(): boolean {
    return this._props.hasRtiqPiq
  }

  get gmoIngredient(): string | null {
    return this._props.gmoIngredient
  }

  get gmoDonorSpecies(): string | null {
    return this._props.gmoDonorSpecies
  }

  get gmoPercentage(): number | null {
    return this._props.gmoPercentage
  }

  get irradiatedIngredient(): string | null {
    return this._props.irradiatedIngredient
  }

  get flavorOriginType(): FlavorOriginType | null {
    return this._props.flavorOriginType
  }

  get colorantOriginType(): ColorantOriginType | null {
    return this._props.colorantOriginType
  }

  // --------------- Labeling Profile Getters ---------------

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

  // --------------- Technical Profile Getters ---------------

  get pac(): number | null {
    return this._props.pac
  }

  get pod(): number | null {
    return this._props.pod
  }

  get totalSolids(): number | null {
    return this._props.totalSolids
  }

  get ashContent(): number | null {
    return this._props.ashContent
  }

  // --------------- Behaviors ---------------

  changeCode(code: string): void {
    this.ensureActivated('Ingredient_TE')
    this._props.code = code
    this.touch()
  }

  changeExternalCode(externalCode: string | null): void {
    this.ensureActivated('Ingredient_TE')
    this._props.externalCode = externalCode
    this.touch()
  }

  changeInternalName(internalName: string): void {
    this.ensureActivated('Ingredient_TE')
    this._props.internalName = internalName
    this.touch()
  }

  changeCommercialName(commercialName: string | null): void {
    this.ensureActivated('Ingredient_TE')
    this._props.commercialName = commercialName
    this.touch()
  }

  changeSaleDenomination(saleDenomination: string | null): void {
    this.ensureActivated('Ingredient_TE')
    this._props.saleDenomination = saleDenomination
    this.touch()
  }

  changeFunctionalGroup(functionalGroupId: string | null): void {
    this.ensureActivated('Ingredient_TE')
    this._props.functionalGroupId = functionalGroupId
    this.touch()
  }

  changeIngredientFunction(ingredientFunction: IngredientFunctionType): void {
    this.ensureActivated('Ingredient_TE')
    this._props.ingredientFunction = ingredientFunction
    this.touch()
  }

  changeNotes(notes: string | null): void {
    this.ensureActivated('Ingredient_TE')
    this._props.notes = notes
    this.touch()
  }

  changeManufacturer(manufacturerId: string | null): void {
    this.ensureActivated('Ingredient_TE')
    this._props.manufacturerId = manufacturerId
    this.touch()
  }

  changeSupplier(supplierId: string | null): void {
    this.ensureActivated('Ingredient_TE')
    this._props.supplierId = supplierId
    this.touch()
  }

  changeTechnicalSource(technicalSourceId: string | null): void {
    this.ensureActivated('Ingredient_TE')
    this._props.technicalSourceId = technicalSourceId
    this.touch()
  }

  changeUsageIndication(usageIndication: string | null): void {
    this.ensureActivated('Ingredient_TE')
    this._props.usageIndication = usageIndication
    this.touch()
  }

  changeIngredientsListDesc(ingredientsListDesc: string | null): void {
    this.ensureActivated('Ingredient_TE')
    this._props.ingredientsListDesc = ingredientsListDesc
    this.touch()
  }

  // --------------- Regulatory Profile Behaviors ---------------

  changeHasRtiqPiq(hasRtiqPiq: boolean): void {
    this.ensureActivated('Ingredient_TE')
    this._props.hasRtiqPiq = hasRtiqPiq
    this.touch()
  }

  changeGmoIngredient(gmoIngredient: string | null): void {
    this.ensureActivated('Ingredient_TE')
    this._props.gmoIngredient = gmoIngredient
    this.touch()
  }

  changeGmoDonorSpecies(gmoDonorSpecies: string | null): void {
    this.ensureActivated('Ingredient_TE')
    this._props.gmoDonorSpecies = gmoDonorSpecies
    this.touch()
  }

  changeGmoPercentage(gmoPercentage: number | null): void {
    this.ensureActivated('Ingredient_TE')
    this._props.gmoPercentage = gmoPercentage
    this.touch()
  }

  changeIrradiatedIngredient(irradiatedIngredient: string | null): void {
    this.ensureActivated('Ingredient_TE')
    this._props.irradiatedIngredient = irradiatedIngredient
    this.touch()
  }

  changeFlavorOriginType(flavorOriginType: FlavorOriginType | null): void {
    this.ensureActivated('Ingredient_TE')
    this._props.flavorOriginType = flavorOriginType
    this.touch()
  }

  changeColorantOriginType(colorantOriginType: ColorantOriginType | null): void {
    this.ensureActivated('Ingredient_TE')
    this._props.colorantOriginType = colorantOriginType
    this.touch()
  }

  // --------------- Labeling Profile Behaviors ---------------

  changeContainsAddedSugars(containsAddedSugars: boolean): void {
    this.ensureActivated('Ingredient_TE')
    this._props.containsAddedSugars = containsAddedSugars
    this.touch()
  }

  changeContainsIngredientWithAddedSugars(containsIngredientWithAddedSugars: boolean): void {
    this.ensureActivated('Ingredient_TE')
    this._props.containsIngredientWithAddedSugars = containsIngredientWithAddedSugars
    this.touch()
  }

  changeContainsNaturallyOccurringSugarSubstitutes(containsNaturallyOccurringSugarSubstitutes: boolean): void {
    this.ensureActivated('Ingredient_TE')
    this._props.containsNaturallyOccurringSugarSubstitutes = containsNaturallyOccurringSugarSubstitutes
    this.touch()
  }

  changeUsesProcessingThatIncreasesSugars(usesProcessingThatIncreasesSugars: boolean): void {
    this.ensureActivated('Ingredient_TE')
    this._props.usesProcessingThatIncreasesSugars = usesProcessingThatIncreasesSugars
    this.touch()
  }

  changeContainsAddedFatsOrOils(containsAddedFatsOrOils: boolean): void {
    this.ensureActivated('Ingredient_TE')
    this._props.containsAddedFatsOrOils = containsAddedFatsOrOils
    this.touch()
  }

  changeContainsButterOrMargarine(containsButterOrMargarine: boolean): void {
    this.ensureActivated('Ingredient_TE')
    this._props.containsButterOrMargarine = containsButterOrMargarine
    this.touch()
  }

  changeContainsDairyCream(containsDairyCream: boolean): void {
    this.ensureActivated('Ingredient_TE')
    this._props.containsDairyCream = containsDairyCream
    this.touch()
  }

  changeContainsIngredientsWithFatsOrCream(containsIngredientsWithFatsOrCream: boolean): void {
    this.ensureActivated('Ingredient_TE')
    this._props.containsIngredientsWithFatsOrCream = containsIngredientsWithFatsOrCream
    this.touch()
  }

  // --------------- Technical Profile Behaviors ---------------

  changePac(pac: number | null): void {
    this.ensureActivated('Ingredient_TE')
    this._props.pac = pac
    this.touch()
  }

  changePod(pod: number | null): void {
    this.ensureActivated('Ingredient_TE')
    this._props.pod = pod
    this.touch()
  }

  changeTotalSolids(totalSolids: number | null): void {
    this.ensureActivated('Ingredient_TE')
    this._props.totalSolids = totalSolids
    this.touch()
  }

  changeAshContent(ashContent: number | null): void {
    this.ensureActivated('Ingredient_TE')
    this._props.ashContent = ashContent
    this.touch()
  }

  setInactive(): void {
    if (this._props.systemState === SystemState.DELETED) return
    this._props.systemState = SystemState.DELETED
    this.touch()
  }

  toggleActive(): void {
    if (this._props.systemState === SystemState.ACTIVE) {
      this.setInactive()
    } else if (this._props.systemState === SystemState.LOCKED) {
      // Locked entities cannot be toggled
      throw new EntityLockedError('Ingredient_TE')
    } else {
      this.activate()
    }
  }

  // Ingredient_TE uses systemState only (no separate isActive domain field).
  // activate/lock/delete manage systemState directly.
  // Locked entities cannot be reactivated — requires unlock first.
  activate(): void {
    this.ensureActivated('Ingredient_TE')
    super.activate()
  }

  lock(): void {
    super.lock()
  }

  delete(): void {
    super.delete()
  }
}
