import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'

export type TechnicalInfoSourceProps = AuditableProps &
  LockableProps & {
    id: Id
    tenantId: string
    sourceType: string
    referenceName: string
    url: string | null
    documentRef: string | null
  }

export type CreateTechnicalInfoSourceProps = Omit<
  TechnicalInfoSourceProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class TechnicalInfoSource extends Lockable(
  Auditable(Base<TechnicalInfoSourceProps>)
) {
  protected constructor(props: TechnicalInfoSourceProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateTechnicalInfoSourceProps): TechnicalInfoSource {
    // TODO: zod validate input
    const now = new Date()

    return new TechnicalInfoSource({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: TechnicalInfoSourceProps): TechnicalInfoSource {
    return new TechnicalInfoSource(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
  }

  get tenantId(): string {
    return this._props.tenantId
  }

  get sourceType(): string {
    return this._props.sourceType
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

  // --------------- Behaviors ---------------

  changeSourceType(sourceType: string): void {
    this.ensureActivated('TechnicalInfoSource')
    this._props.sourceType = sourceType
    this.touch()
  }

  changeReferenceName(referenceName: string): void {
    this.ensureActivated('TechnicalInfoSource')
    this._props.referenceName = referenceName
    this.touch()
  }

  changeUrl(url: string | null): void {
    this.ensureActivated('TechnicalInfoSource')
    this._props.url = url
    this.touch()
  }

  changeDocumentRef(documentRef: string | null): void {
    this.ensureActivated('TechnicalInfoSource')
    this._props.documentRef = documentRef
    this.touch()
  }

  // Locked entities cannot be reactivated — requires unlock first
  activate(): void {
    this.ensureActivated('TechnicalInfoSource')
    super.activate()
  }

  lock(): void {
    super.lock()
  }

  delete(): void {
    super.delete()
  }
}
