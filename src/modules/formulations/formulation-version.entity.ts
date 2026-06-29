import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import { SystemState, Lockable, type LockableProps } from '@shared/behaviours/lockable'

export type FormulationVersion_TEProps = AuditableProps & LockableProps & {
  id: Id
  tenantId: string
  productId: string
  version: number
  notes: string | null
}

export type CreateFormulationVersion_TEProps = Omit<FormulationVersion_TEProps, keyof AuditableProps | keyof LockableProps | 'id' | 'notes'> & { notes?: string | null }

export class FormulationVersion_TE extends Lockable(Auditable(Base<FormulationVersion_TEProps>)) {
  protected constructor(props: FormulationVersion_TEProps) {
    super(props)
  }

  static create(props: CreateFormulationVersion_TEProps): FormulationVersion_TE {
    // TODO: zod validate input
    const now = new Date()
    return new FormulationVersion_TE({
      ...props,
      id: Id.generate(),
      notes: props.notes ?? null,
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE,
    })
  }

  static rehydrate(props: FormulationVersion_TEProps): FormulationVersion_TE {
    return new FormulationVersion_TE(props)
  }

  get id(): Id { return this._props.id }
  get tenantId(): string { return this._props.tenantId }
  get productId(): string { return this._props.productId }
  get version(): number { return this._props.version }
  get notes(): string | null { return this._props.notes }

  changeNotes(notes: string | null): void {
    this.ensureActivated('FormulationVersion_TE')
    this._props.notes = notes
    this.touch()
  }

  activate(): void {
    this.ensureActivated('FormulationVersion_TE')
    super.activate()
  }

  lock(): void { super.lock() }
  delete(): void { super.delete() }
}
