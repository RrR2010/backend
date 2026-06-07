import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'

export type FormulationItemProps = AuditableProps & {
  id: Id
  formulationRevisionId: string
  ingredientId: string
  quantity: number
  unit: string
}

export type CreateFormulationItemProps = Omit<FormulationItemProps, keyof AuditableProps | 'id' | 'unit'> & { unit?: string }

export class FormulationItem extends Auditable(Base<FormulationItemProps>) {
  protected constructor(props: FormulationItemProps) {
    super(props)
  }

  static create(props: CreateFormulationItemProps): FormulationItem {
    // TODO: zod validate input
    const now = new Date()
    return new FormulationItem({
      ...props,
      id: Id.generate(),
      unit: props.unit ?? 'g',
      createdAt: now,
      updatedAt: now,
    })
  }

  static rehydrate(props: FormulationItemProps): FormulationItem {
    return new FormulationItem(props)
  }

  get id(): Id { return this._props.id }
  get formulationRevisionId(): string { return this._props.formulationRevisionId }
  get ingredientId(): string { return this._props.ingredientId }
  get quantity(): number { return this._props.quantity }
  get unit(): string { return this._props.unit }

  changeQuantity(quantity: number): void {
    this._props.quantity = quantity
    this.touch()
  }

  changeUnit(unit: string): void {
    this._props.unit = unit
    this.touch()
  }
}
