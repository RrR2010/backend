import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import { SystemState, Lockable, type LockableProps } from '@shared/behaviours/lockable'

export type FormulationVersionProps = AuditableProps & LockableProps & {
  id: Id
  tenantId: string
  productId: string
  version: number
  notes: string | null
}

export type CreateFormulationVersionProps = Omit<FormulationVersionProps, keyof AuditableProps | keyof LockableProps | 'id' | 'notes'> & { notes?: string | null }

export class FormulationVersion extends Lockable(Auditable(Base<FormulationVersionProps>)) {
  protected constructor(props: FormulationVersionProps) {
    super(props)
  }

  static create(props: CreateFormulationVersionProps): FormulationVersion {
    // TODO: zod validate input
    const now = new Date()
    return new FormulationVersion({
      ...props,
      id: Id.generate(),
      notes: props.notes ?? null,
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE,
    })
  }

  static rehydrate(props: FormulationVersionProps): FormulationVersion {
    return new FormulationVersion(props)
  }

  get id(): Id { return this._props.id }
  get tenantId(): string { return this._props.tenantId }
  get productId(): string { return this._props.productId }
  get version(): number { return this._props.version }
  get notes(): string | null { return this._props.notes }

  changeNotes(notes: string | null): void {
    this.ensureActivated('FormulationVersion')
    this._props.notes = notes
    this.touch()
  }

  activate(): void {
    this.ensureActivated('FormulationVersion')
    super.activate()
  }

  lock(): void { super.lock() }
  delete(): void { super.delete() }
}
