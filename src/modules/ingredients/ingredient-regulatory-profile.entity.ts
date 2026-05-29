import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'

import { FlavorOriginType, ColorantOriginType } from '@prisma/client'

export type IngredientRegulatoryProfileProps = AuditableProps &
  LockableProps & {
    id: Id
    tenantId: string
    ingredientId: string
    hasRtiq: boolean
    isGmo: boolean
    gmoIngredient: string | null
    gmoDonorSpecies: string | null
    gmoPercentage: number | null
    isIrradiated: boolean
    irradiatedIngredient: string | null
    containsLactose: boolean
    containsGluten: boolean
    containsAspartame: boolean
    flavorOriginType: FlavorOriginType | null
    colorantOriginType: ColorantOriginType | null
  }

export type CreateIngredientRegulatoryProfileProps = Omit<
  IngredientRegulatoryProfileProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class IngredientRegulatoryProfile extends Lockable(
  Auditable(Base<IngredientRegulatoryProfileProps>)
) {
  protected constructor(props: IngredientRegulatoryProfileProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(
    props: CreateIngredientRegulatoryProfileProps
  ): IngredientRegulatoryProfile {
    // TODO: zod validate input
    const now = new Date()
    return new IngredientRegulatoryProfile({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(
    props: IngredientRegulatoryProfileProps
  ): IngredientRegulatoryProfile {
    return new IngredientRegulatoryProfile(props)
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

  get hasRtiq(): boolean {
    return this._props.hasRtiq
  }

  get isGmo(): boolean {
    return this._props.isGmo
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

  get isIrradiated(): boolean {
    return this._props.isIrradiated
  }

  get irradiatedIngredient(): string | null {
    return this._props.irradiatedIngredient
  }

  get containsLactose(): boolean {
    return this._props.containsLactose
  }

  get containsGluten(): boolean {
    return this._props.containsGluten
  }

  get containsAspartame(): boolean {
    return this._props.containsAspartame
  }

  get flavorOriginType(): FlavorOriginType | null {
    return this._props.flavorOriginType
  }

  get colorantOriginType(): ColorantOriginType | null {
    return this._props.colorantOriginType
  }

  // --------------- Behaviors ---------------

  changeHasRtiq(hasRtiq: boolean): void {
    this.ensureActivated('IngredientRegulatoryProfile')
    this._props.hasRtiq = hasRtiq
    this.touch()
  }

  changeIsGmo(isGmo: boolean): void {
    this.ensureActivated('IngredientRegulatoryProfile')
    this._props.isGmo = isGmo
    this.touch()
  }

  changeGmoIngredient(gmoIngredient: string | null): void {
    this.ensureActivated('IngredientRegulatoryProfile')
    this._props.gmoIngredient = gmoIngredient
    this.touch()
  }

  changeGmoDonorSpecies(gmoDonorSpecies: string | null): void {
    this.ensureActivated('IngredientRegulatoryProfile')
    this._props.gmoDonorSpecies = gmoDonorSpecies
    this.touch()
  }

  changeGmoPercentage(gmoPercentage: number | null): void {
    this.ensureActivated('IngredientRegulatoryProfile')
    this._props.gmoPercentage = gmoPercentage
    this.touch()
  }

  changeIsIrradiated(isIrradiated: boolean): void {
    this.ensureActivated('IngredientRegulatoryProfile')
    this._props.isIrradiated = isIrradiated
    this.touch()
  }

  changeIrradiatedIngredient(irradiatedIngredient: string | null): void {
    this.ensureActivated('IngredientRegulatoryProfile')
    this._props.irradiatedIngredient = irradiatedIngredient
    this.touch()
  }

  changeContainsLactose(containsLactose: boolean): void {
    this.ensureActivated('IngredientRegulatoryProfile')
    this._props.containsLactose = containsLactose
    this.touch()
  }

  changeContainsGluten(containsGluten: boolean): void {
    this.ensureActivated('IngredientRegulatoryProfile')
    this._props.containsGluten = containsGluten
    this.touch()
  }

  changeContainsAspartame(containsAspartame: boolean): void {
    this.ensureActivated('IngredientRegulatoryProfile')
    this._props.containsAspartame = containsAspartame
    this.touch()
  }

  changeFlavorOriginType(flavorOriginType: FlavorOriginType | null): void {
    this.ensureActivated('IngredientRegulatoryProfile')
    this._props.flavorOriginType = flavorOriginType
    this.touch()
  }

  changeColorantOriginType(
    colorantOriginType: ColorantOriginType | null
  ): void {
    this.ensureActivated('IngredientRegulatoryProfile')
    this._props.colorantOriginType = colorantOriginType
    this.touch()
  }

  activate(): void {
    this.ensureActivated('IngredientRegulatoryProfile')
    super.activate()
  }
}
