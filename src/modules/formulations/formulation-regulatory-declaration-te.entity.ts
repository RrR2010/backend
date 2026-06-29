import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'

export type FormulationRegulatoryDeclaration_TEProps = AuditableProps & {
  id: Id
  tenantId: string
  formulationRevisionId: string
  flagId: string
  flagValue: boolean
  notes: string | null
}

export type CreateFormulationRegulatoryDeclaration_TEProps = Omit<
  FormulationRegulatoryDeclaration_TEProps,
  keyof AuditableProps | 'id' | 'notes'
> & { notes?: string | null }

export class FormulationRegulatoryDeclaration_TE extends Auditable(
  Base<FormulationRegulatoryDeclaration_TEProps>
) {
  protected constructor(props: FormulationRegulatoryDeclaration_TEProps) {
    super(props)
  }

  static create(
    props: CreateFormulationRegulatoryDeclaration_TEProps
  ): FormulationRegulatoryDeclaration_TE {
    const now = new Date()
    return new FormulationRegulatoryDeclaration_TE({
      ...props,
      id: Id.generate(),
      notes: props.notes ?? null,
      createdAt: now,
      updatedAt: now
    })
  }

  static rehydrate(
    props: FormulationRegulatoryDeclaration_TEProps
  ): FormulationRegulatoryDeclaration_TE {
    return new FormulationRegulatoryDeclaration_TE(props)
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

  get flagId(): string {
    return this._props.flagId
  }

  get flagValue(): boolean {
    return this._props.flagValue
  }

  get notes(): string | null {
    return this._props.notes
  }

  changeFlagValue(flagValue: boolean): void {
    this._props.flagValue = flagValue
    this.touch()
  }

  changeNotes(notes: string | null): void {
    this._props.notes = notes
    this.touch()
  }
}
