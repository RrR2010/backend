import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'

export type FormulationOgmDonor_TEProps = AuditableProps & {
  id: Id
  tenantId: string
  formulationRevisionId: string
  ogmDonorSpeciesId: string
}

export type CreateFormulationOgmDonor_TEProps = Omit<
  FormulationOgmDonor_TEProps,
  keyof AuditableProps | 'id'
>

export class FormulationOgmDonor_TE extends Auditable(
  Base<FormulationOgmDonor_TEProps>
) {
  protected constructor(props: FormulationOgmDonor_TEProps) {
    super(props)
  }

  static create(
    props: CreateFormulationOgmDonor_TEProps
  ): FormulationOgmDonor_TE {
    const now = new Date()
    return new FormulationOgmDonor_TE({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now
    })
  }

  static rehydrate(props: FormulationOgmDonor_TEProps): FormulationOgmDonor_TE {
    return new FormulationOgmDonor_TE(props)
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

  get ogmDonorSpeciesId(): string {
    return this._props.ogmDonorSpeciesId
  }

  changeOgmDonorSpeciesId(ogmDonorSpeciesId: string): void {
    this._props.ogmDonorSpeciesId = ogmDonorSpeciesId
    this.touch()
  }
}
