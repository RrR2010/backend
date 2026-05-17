import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import { SystemState, Lockable, type LockableProps } from '@shared/behaviours/lockable'
import { OwnerType, PhoneType } from '@shared/enums'

export type PhoneProps = AuditableProps & LockableProps & {
  id: Id
  ownerId: string
  ownerType: OwnerType
  type: PhoneType
  countryCode: string
  number: string
  isWhatsapp: boolean
  isDefault: boolean
}

export type CreatePhoneProps = Omit<
  PhoneProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class Phone extends Lockable(Auditable(Base<PhoneProps>)) {
  protected constructor(props: PhoneProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreatePhoneProps): Phone {
    const now = new Date()

    return new Phone({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: PhoneProps): Phone {
    return new Phone(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
  }

  get ownerId(): string {
    return this._props.ownerId
  }

  get ownerType(): OwnerType {
    return this._props.ownerType
  }

  get type(): PhoneType {
    return this._props.type
  }

  get countryCode(): string {
    return this._props.countryCode
  }

  get number(): string {
    return this._props.number
  }

  get isWhatsapp(): boolean {
    return this._props.isWhatsapp
  }

  get isDefault(): boolean {
    return this._props.isDefault
  }

  // --------------- Computed Getters ---------------

  get fullNumber(): string {
    return `+${this.countryCode} ${this.number}`
  }

  get formattedForWhatsapp(): string {
    // Remove non-digits for WhatsApp
    const digits = this.number.replace(/\D/g, '')
    return `+${this.countryCode}${digits}`
  }

  // --------------- Behaviours ---------------

  setAsDefault(): void {
    this.ensureActivated('Phone')
    this._props.isDefault = true
    this.touch()
  }

  unsetDefault(): void {
    this.ensureActivated('Phone')
    this._props.isDefault = false
    this.touch()
  }

  setAsWhatsapp(): void {
    this.ensureActivated('Phone')
    this._props.isWhatsapp = true
    this.touch()
  }

  unsetWhatsapp(): void {
    this.ensureActivated('Phone')
    this._props.isWhatsapp = false
    this.touch()
  }

  changeCountryCode(countryCode: string): void {
    this.ensureActivated('Phone')
    this._props.countryCode = countryCode
    this.touch()
  }

  changeNumber(number: string): void {
    this.ensureActivated('Phone')
    this._props.number = number
    this.touch()
  }

  changeType(type: PhoneType): void {
    this.ensureActivated('Phone')
    this._props.type = type
    this.touch()
  }
}