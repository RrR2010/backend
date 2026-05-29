import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'
import { OwnerType, AddressType } from '@shared/enums'

export type AddressProps = AuditableProps &
  LockableProps & {
    id: Id
    ownerId: string
    ownerType: OwnerType
    type: AddressType
    street: string
    number: string
    complement: string | null
    district: string | null
    city: string
    state: string
    postalCode: string
    country: string
    isDefault: boolean
  }

export type CreateAddressProps = Omit<
  AddressProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class Address extends Lockable(Auditable(Base<AddressProps>)) {
  protected constructor(props: AddressProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateAddressProps): Address {
    const now = new Date()

    return new Address({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: AddressProps): Address {
    return new Address(props)
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

  get type(): AddressType {
    return this._props.type
  }

  get street(): string {
    return this._props.street
  }

  get number(): string {
    return this._props.number
  }

  get complement(): string | null {
    return this._props.complement
  }

  get district(): string | null {
    return this._props.district
  }

  get city(): string {
    return this._props.city
  }

  get state(): string {
    return this._props.state
  }

  get postalCode(): string {
    return this._props.postalCode
  }

  get country(): string {
    return this._props.country
  }

  get isDefault(): boolean {
    return this._props.isDefault
  }

  // --------------- Computed Getters ---------------

  get formattedAddress(): string {
    const parts = [
      this.street,
      this.number,
      this.complement,
      this.district,
      `${this.city}/${this.state}`,
      this.postalCode,
      this.country
    ]

    return parts.filter(Boolean).join(', ')
  }

  // --------------- Address Behaviors ---------------

  setAsDefault(): void {
    this.ensureActivated('Address')
    this._props.isDefault = true
    this.touch()
  }

  unsetDefault(): void {
    this.ensureActivated('Address')
    this._props.isDefault = false
    this.touch()
  }

  changeStreet(street: string): void {
    this.ensureActivated('Address')
    this._props.street = street
    this.touch()
  }

  changeNumber(number: string): void {
    this.ensureActivated('Address')
    this._props.number = number
    this.touch()
  }

  changeComplement(complement: string | null): void {
    this.ensureActivated('Address')
    this._props.complement = complement
    this.touch()
  }

  changeDistrict(district: string | null): void {
    this.ensureActivated('Address')
    this._props.district = district
    this.touch()
  }

  changeCity(city: string): void {
    this.ensureActivated('Address')
    this._props.city = city
    this.touch()
  }

  changeState(state: string): void {
    this.ensureActivated('Address')
    this._props.state = state
    this.touch()
  }

  changePostalCode(postalCode: string): void {
    this.ensureActivated('Address')
    this._props.postalCode = postalCode
    this.touch()
  }

  changeCountry(country: string): void {
    this.ensureActivated('Address')
    this._props.country = country
    this.touch()
  }

  changeType(type: AddressType): void {
    this.ensureActivated('Address')
    this._props.type = type
    this.touch()
  }
}
