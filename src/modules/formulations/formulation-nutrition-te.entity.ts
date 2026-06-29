import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'

export type FormulationNutrition_TEProps = AuditableProps & {
  id: Id
  tenantId: string
  formulationRevisionId: string
  nutrientId: string
  declaredValue: number | null
  calculatedValue: number | null
  refValue: number | null
  notes: string | null
}

export type CreateFormulationNutrition_TEProps = Omit<
  FormulationNutrition_TEProps,
  keyof AuditableProps | 'id' | 'declaredValue' | 'calculatedValue' | 'refValue' | 'notes'
> & {
  declaredValue?: number | null
  calculatedValue?: number | null
  refValue?: number | null
  notes?: string | null
}

export class FormulationNutrition_TE extends Auditable(
  Base<FormulationNutrition_TEProps>
) {
  protected constructor(props: FormulationNutrition_TEProps) {
    super(props)
  }

  static create(
    props: CreateFormulationNutrition_TEProps
  ): FormulationNutrition_TE {
    const now = new Date()
    return new FormulationNutrition_TE({
      ...props,
      id: Id.generate(),
      declaredValue: props.declaredValue ?? null,
      calculatedValue: props.calculatedValue ?? null,
      refValue: props.refValue ?? null,
      notes: props.notes ?? null,
      createdAt: now,
      updatedAt: now
    })
  }

  static rehydrate(
    props: FormulationNutrition_TEProps
  ): FormulationNutrition_TE {
    return new FormulationNutrition_TE(props)
  }

  get id(): Id {
    return this._props.id
  }

  get tenantId(): string {
    return this._props.tenantId
  }

  get formulationRevisionId(): string {
    return this._props.formulationRevisionId
  }

  get nutrientId(): string {
    return this._props.nutrientId
  }

  get declaredValue(): number | null {
    return this._props.declaredValue
  }

  get calculatedValue(): number | null {
    return this._props.calculatedValue
  }

  get refValue(): number | null {
    return this._props.refValue
  }

  get notes(): string | null {
    return this._props.notes
  }

  changeDeclaredValue(declaredValue: number | null): void {
    this._props.declaredValue = declaredValue
    this.touch()
  }

  changeCalculatedValue(calculatedValue: number | null): void {
    this._props.calculatedValue = calculatedValue
    this.touch()
  }

  changeRefValue(refValue: number | null): void {
    this._props.refValue = refValue
    this.touch()
  }

  changeNotes(notes: string | null): void {
    this._props.notes = notes
    this.touch()
  }
}
