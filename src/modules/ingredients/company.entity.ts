import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'

export type Company_TEProps = AuditableProps &
  LockableProps & {
    id: Id
    tenantId: string
    name: string
    type: string
    contactInfo: string | null
    taxId: string | null
  }

export type CreateCompany_TEProps = Omit<
  Company_TEProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class Company_TE extends Lockable(Auditable(Base<Company_TEProps>)) {
  protected constructor(props: Company_TEProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateCompany_TEProps): Company_TE {
    // TODO: zod validate input
    const now = new Date()

    return new Company_TE({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: Company_TEProps): Company_TE {
    return new Company_TE(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
  }

  get tenantId(): string {
    return this._props.tenantId
  }

  get name(): string {
    return this._props.name
  }

  get type(): string {
    return this._props.type
  }

  get contactInfo(): string | null {
    return this._props.contactInfo
  }

  get taxId(): string | null {
    return this._props.taxId
  }

  // --------------- Behaviors ---------------

  changeName(name: string): void {
    this.ensureActivated('Company_TE')
    this._props.name = name
    this.touch()
  }

  changeType(type: string): void {
    this.ensureActivated('Company_TE')
    this._props.type = type
    this.touch()
  }

  changeContactInfo(contactInfo: string | null): void {
    this.ensureActivated('Company_TE')
    this._props.contactInfo = contactInfo
    this.touch()
  }

  changeTaxId(taxId: string | null): void {
    this.ensureActivated('Company_TE')
    this._props.taxId = taxId
    this.touch()
  }

  // Locked entities cannot be reactivated — requires unlock first
  activate(): void {
    this.ensureActivated('Company_TE')
    super.activate()
  }

  lock(): void {
    super.lock()
  }

  delete(): void {
    super.delete()
  }
}
