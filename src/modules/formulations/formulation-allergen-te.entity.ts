import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'

export type FormulationAllergen_TEProps = AuditableProps & {
  id: Id
  tenantId: string
  formulationRevisionId: string
  allergenDeclaration: string | null
  allergenMayContain: string | null
}

export type CreateFormulationAllergen_TEProps = Omit<
  FormulationAllergen_TEProps,
  keyof AuditableProps | 'id' | 'allergenDeclaration' | 'allergenMayContain'
> & {
  allergenDeclaration?: string | null
  allergenMayContain?: string | null
}

export class FormulationAllergen_TE extends Auditable(
  Base<FormulationAllergen_TEProps>
) {
  protected constructor(props: FormulationAllergen_TEProps) {
    super(props)
  }

  static create(
    props: CreateFormulationAllergen_TEProps
  ): FormulationAllergen_TE {
    const now = new Date()
    return new FormulationAllergen_TE({
      ...props,
      id: Id.generate(),
      allergenDeclaration: props.allergenDeclaration ?? null,
      allergenMayContain: props.allergenMayContain ?? null,
      createdAt: now,
      updatedAt: now
    })
  }

  static rehydrate(
    props: FormulationAllergen_TEProps
  ): FormulationAllergen_TE {
    return new FormulationAllergen_TE(props)
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

  get allergenDeclaration(): string | null {
    return this._props.allergenDeclaration
  }

  get allergenMayContain(): string | null {
    return this._props.allergenMayContain
  }

  changeAllergenDeclaration(allergenDeclaration: string | null): void {
    this._props.allergenDeclaration = allergenDeclaration
    this.touch()
  }

  changeAllergenMayContain(allergenMayContain: string | null): void {
    this._props.allergenMayContain = allergenMayContain
    this.touch()
  }
}
