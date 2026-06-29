import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'

export type TechnicalSource_TEProps = AuditableProps &
  LockableProps & {
    id: Id
    tenantId: string
    sourceTypePlId: string | null
    sourceTypeTeId: string | null
    referenceName: string
    url: string | null
    documentRef: string | null
    notes: string | null
  }

export type CreateTechnicalSource_TEProps = Omit<
  TechnicalSource_TEProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class TechnicalSource_TE extends Lockable(
  Auditable(Base<TechnicalSource_TEProps>)
) {
  protected constructor(props: TechnicalSource_TEProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateTechnicalSource_TEProps): TechnicalSource_TE {
    // TODO: zod validate input
    const now = new Date()

    return new TechnicalSource_TE({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: TechnicalSource_TEProps): TechnicalSource_TE {
    return new TechnicalSource_TE(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
  }

  get tenantId(): string {
    return this._props.tenantId
  }

  get sourceTypePlId(): string | null {
    return this._props.sourceTypePlId
  }

  get sourceTypeTeId(): string | null {
    return this._props.sourceTypeTeId
  }

  get referenceName(): string {
    return this._props.referenceName
  }

  get url(): string | null {
    return this._props.url
  }

  get documentRef(): string | null {
    return this._props.documentRef
  }

  get notes(): string | null {
    return this._props.notes
  }

  // --------------- Behaviors ---------------

  changeSourceType(
    sourceTypePlId: string | null,
    sourceTypeTeId: string | null
  ): void {
    this.ensureActivated('TechnicalSource_TE')
    this._props.sourceTypePlId = sourceTypePlId
    this._props.sourceTypeTeId = sourceTypeTeId
    this.touch()
  }

  changeReferenceName(referenceName: string): void {
    this.ensureActivated('TechnicalSource_TE')
    this._props.referenceName = referenceName
    this.touch()
  }

  changeUrl(url: string | null): void {
    this.ensureActivated('TechnicalSource_TE')
    this._props.url = url
    this.touch()
  }

  changeDocumentRef(documentRef: string | null): void {
    this.ensureActivated('TechnicalSource_TE')
    this._props.documentRef = documentRef
    this.touch()
  }

  changeNotes(notes: string | null): void {
    this.ensureActivated('TechnicalSource_TE')
    this._props.notes = notes
    this.touch()
  }

  // Locked entities cannot be reactivated — requires unlock first
  activate(): void {
    this.ensureActivated('TechnicalSource_TE')
    super.activate()
  }

  lock(): void {
    super.lock()
  }

  delete(): void {
    super.delete()
  }
}
