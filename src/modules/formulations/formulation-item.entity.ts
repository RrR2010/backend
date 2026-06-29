import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'

export type FormulationItem_TEProps = AuditableProps & {
  id: Id
  formulationRevisionId: string
  ingredientId: string
  quantity: number
  unitId: string
  tenantId: string
  usageCategory: string | null
  componentGroup: string | null
  sortOrder: number
  notes: string | null
}

export type CreateFormulationItem_TEProps = Omit<
  FormulationItem_TEProps,
  keyof AuditableProps | 'id' | 'usageCategory' | 'componentGroup' | 'sortOrder' | 'notes'
> & {
  usageCategory?: string | null
  componentGroup?: string | null
  sortOrder?: number
  notes?: string | null
}

export class FormulationItem_TE extends Auditable(Base<FormulationItem_TEProps>) {
  protected constructor(props: FormulationItem_TEProps) {
    super(props)
  }

  static create(props: CreateFormulationItem_TEProps): FormulationItem_TE {
    // TODO: zod validate input
    const now = new Date()
    return new FormulationItem_TE({
      ...props,
      id: Id.generate(),
      usageCategory: props.usageCategory ?? null,
      componentGroup: props.componentGroup ?? null,
      sortOrder: props.sortOrder ?? 0,
      notes: props.notes ?? null,
      createdAt: now,
      updatedAt: now,
    })
  }

  static rehydrate(props: FormulationItem_TEProps): FormulationItem_TE {
    return new FormulationItem_TE(props)
  }

  get id(): Id { return this._props.id }
  get formulationRevisionId(): string { return this._props.formulationRevisionId }
  get ingredientId(): string { return this._props.ingredientId }
  get quantity(): number { return this._props.quantity }
  get unitId(): string { return this._props.unitId }
  get tenantId(): string { return this._props.tenantId }
  get usageCategory(): string | null { return this._props.usageCategory }
  get componentGroup(): string | null { return this._props.componentGroup }
  get sortOrder(): number { return this._props.sortOrder }
  get notes(): string | null { return this._props.notes }

  changeQuantity(quantity: number): void {
    this._props.quantity = quantity
    this.touch()
  }

  changeUnitId(unitId: string): void {
    this._props.unitId = unitId
    this.touch()
  }

  changeUsageCategory(usageCategory: string | null): void {
    this._props.usageCategory = usageCategory
    this.touch()
  }

  changeComponentGroup(componentGroup: string | null): void {
    this._props.componentGroup = componentGroup
    this.touch()
  }

  changeSortOrder(sortOrder: number): void {
    this._props.sortOrder = sortOrder
    this.touch()
  }

  changeNotes(notes: string | null): void {
    this._props.notes = notes
    this.touch()
  }
}
