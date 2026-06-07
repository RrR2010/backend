import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import { SystemState, Lockable, type LockableProps } from '@shared/behaviours/lockable'

export type FormulationRevisionProps = AuditableProps & LockableProps & {
  id: Id
  formulationVersionId: string
  revision: number
  notes: string | null
  nutritionalSummary: Record<string, unknown> | null
  complianceSummary: Record<string, unknown> | null
}

export type CreateFormulationRevisionProps = Omit<FormulationRevisionProps, keyof AuditableProps | keyof LockableProps | 'id' | 'nutritionalSummary' | 'complianceSummary' | 'notes'> & { notes?: string | null }

export class FormulationRevision extends Lockable(Auditable(Base<FormulationRevisionProps>)) {
  protected constructor(props: FormulationRevisionProps) {
    super(props)
  }

  static create(props: CreateFormulationRevisionProps): FormulationRevision {
    // TODO: zod validate input
    const now = new Date()
    return new FormulationRevision({
      ...props,
      id: Id.generate(),
      notes: props.notes ?? null,
      nutritionalSummary: null,
      complianceSummary: null,
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE,
    })
  }

  static rehydrate(props: FormulationRevisionProps): FormulationRevision {
    return new FormulationRevision(props)
  }

  get id(): Id { return this._props.id }
  get formulationVersionId(): string { return this._props.formulationVersionId }
  get revision(): number { return this._props.revision }
  get notes(): string | null { return this._props.notes }
  get nutritionalSummary(): Record<string, unknown> | null { return this._props.nutritionalSummary }
  get complianceSummary(): Record<string, unknown> | null { return this._props.complianceSummary }

  changeNotes(notes: string | null): void {
    this.ensureActivated('FormulationRevision')
    this._props.notes = notes
    this.touch()
  }

  updateNutritionalSummary(summary: Record<string, unknown>): void {
    this._props.nutritionalSummary = summary
    this.touch()
  }

  updateComplianceSummary(summary: Record<string, unknown>): void {
    this._props.complianceSummary = summary
    this.touch()
  }

  activate(): void {
    this.ensureActivated('FormulationRevision')
    super.activate()
  }

  lock(): void { super.lock() }
  delete(): void { super.delete() }
}
