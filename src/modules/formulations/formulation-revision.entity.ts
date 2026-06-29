import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import { SystemState, Lockable, type LockableProps } from '@shared/behaviours/lockable'
import { FormulationRevisionStatus } from '@prisma/client'

export type FormulationRevision_TEProps = AuditableProps & LockableProps & {
  id: Id
  formulationVersionId: string
  revision: number
  notes: string | null
  status: FormulationRevisionStatus
  tenantId: string
  approverId: string | null
  approvedBy: string | null
  approvedAt: Date | null
  drift: boolean
}

export type CreateFormulationRevision_TEProps = Omit<
  FormulationRevision_TEProps,
  keyof AuditableProps | keyof LockableProps | 'id' | 'notes' | 'status' | 'approverId' | 'approvedBy' | 'approvedAt' | 'drift'
> & { notes?: string | null }

export class FormulationRevision_TE extends Lockable(Auditable(Base<FormulationRevision_TEProps>)) {
  protected constructor(props: FormulationRevision_TEProps) {
    super(props)
  }

  static create(props: CreateFormulationRevision_TEProps): FormulationRevision_TE {
    // TODO: zod validate input
    const now = new Date()
    return new FormulationRevision_TE({
      ...props,
      id: Id.generate(),
      notes: props.notes ?? null,
      status: FormulationRevisionStatus.DRAFT,
      approverId: null,
      approvedBy: null,
      approvedAt: null,
      drift: false,
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE,
    })
  }

  static rehydrate(props: FormulationRevision_TEProps): FormulationRevision_TE {
    return new FormulationRevision_TE(props)
  }

  get id(): Id { return this._props.id }
  get formulationVersionId(): string { return this._props.formulationVersionId }
  get revision(): number { return this._props.revision }
  get notes(): string | null { return this._props.notes }
  get status(): FormulationRevisionStatus { return this._props.status }
  get tenantId(): string { return this._props.tenantId }
  get approverId(): string | null { return this._props.approverId }
  get approvedBy(): string | null { return this._props.approvedBy }
  get approvedAt(): Date | null { return this._props.approvedAt }
  get drift(): boolean { return this._props.drift }

  changeNotes(notes: string | null): void {
    this.ensureActivated('FormulationRevision_TE')
    this._props.notes = notes
    this.touch()
  }

  submitForApproval(): void {
    this.ensureActivated('FormulationRevision_TE')
    if (this._props.status !== FormulationRevisionStatus.DRAFT) {
      throw new Error('Only DRAFT revisions can be submitted for approval')
    }
    this._props.status = FormulationRevisionStatus.PENDING_APPROVAL
    this.touch()
  }

  approve(approverId: string, approvedBy: string): void {
    this.ensureActivated('FormulationRevision_TE')
    if (this._props.status !== FormulationRevisionStatus.PENDING_APPROVAL) {
      throw new Error('Only PENDING_APPROVAL revisions can be approved')
    }
    this._props.status = FormulationRevisionStatus.ACTIVE
    this._props.approverId = approverId
    this._props.approvedBy = approvedBy
    this._props.approvedAt = new Date()
    this.touch()
  }

  rejectToDraft(): void {
    this.ensureActivated('FormulationRevision_TE')
    if (this._props.status !== FormulationRevisionStatus.PENDING_APPROVAL) {
      throw new Error('Only PENDING_APPROVAL revisions can be returned to draft')
    }
    this._props.status = FormulationRevisionStatus.DRAFT
    this.touch()
  }

  archive(): void {
    this.ensureActivated('FormulationRevision_TE')
    if (this._props.status !== FormulationRevisionStatus.ACTIVE) {
      throw new Error('Only ACTIVE revisions can be archived')
    }
    this._props.status = FormulationRevisionStatus.HISTORIC
    this.touch()
  }

  markHistoric(): void {
    this.archive()
  }

  activate(): void {
    this.ensureActivated('FormulationRevision_TE')
    super.activate()
  }

  lock(): void { super.lock() }
  delete(): void { super.delete() }
}
