import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'
import { NutrientUnit, NutrientCategory } from '@prisma/client'

export type NutrientPLProps = AuditableProps &
  LockableProps & {
    id: Id
    name: string
    unit: NutrientUnit
    category: NutrientCategory
    parentId: string | null
    level: number
    sortOrder: number
    regulatoryRef: string | null
    createdBy: string | null
    updatedBy: string | null
  }

export type CreateNutrientPLProps = Omit<
  NutrientPLProps,
  keyof AuditableProps | keyof LockableProps | 'id' | 'createdBy' | 'updatedBy'
>

export class Nutrient_PL extends Lockable(
  Auditable(Base<NutrientPLProps>)
) {
  protected constructor(props: NutrientPLProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateNutrientPLProps): Nutrient_PL {
    const now = new Date()

    return new Nutrient_PL({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      createdBy: null,
      updatedBy: null,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: NutrientPLProps): Nutrient_PL {
    return new Nutrient_PL(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
  }

  get name(): string {
    return this._props.name
  }

  get unit(): NutrientUnit {
    return this._props.unit
  }

  get category(): NutrientCategory {
    return this._props.category
  }

  get parentId(): string | null {
    return this._props.parentId
  }

  get level(): number {
    return this._props.level
  }

  get sortOrder(): number {
    return this._props.sortOrder
  }

  get regulatoryRef(): string | null {
    return this._props.regulatoryRef
  }

  get createdBy(): string | null {
    return this._props.createdBy
  }

  get updatedBy(): string | null {
    return this._props.updatedBy
  }

  // --------------- Behaviors ---------------

  changeName(name: string): void {
    this.ensureActivated('Nutrient_PL')
    this._props.name = name
    this.touch()
  }

  changeUnit(unit: NutrientUnit): void {
    this.ensureActivated('Nutrient_PL')
    this._props.unit = unit
    this.touch()
  }

  changeCategory(category: NutrientCategory): void {
    this.ensureActivated('Nutrient_PL')
    this._props.category = category
    this.touch()
  }

  changeParentId(parentId: string | null): void {
    this.ensureActivated('Nutrient_PL')
    this._props.parentId = parentId
    this.touch()
  }

  changeLevel(level: number): void {
    this.ensureActivated('Nutrient_PL')
    this._props.level = level
    this.touch()
  }

  changeSortOrder(sortOrder: number): void {
    this.ensureActivated('Nutrient_PL')
    this._props.sortOrder = sortOrder
    this.touch()
  }

  changeRegulatoryRef(regulatoryRef: string | null): void {
    this.ensureActivated('Nutrient_PL')
    this._props.regulatoryRef = regulatoryRef
    this.touch()
  }
}
