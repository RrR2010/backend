import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'
import { Gender } from '@shared/enums'
import { MemberProfileLockedError } from '@member-profiles/member-profile.errors'

export type MemberProfileProps = AuditableProps &
  LockableProps & {
    id: Id
    externalId: string | null
    fullName: string
    displayName: string | null
    dateOfBirth: Date | null
    gender: Gender | null
    photoUrl: string | null
    locale: string
    timezone: string
    language: string
    platformMembershipId: string | null
    tenantMembershipId: string | null
  }

export type CreateMemberProfileProps = Omit<
  MemberProfileProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class MemberProfile extends Lockable(
  Auditable(Base<MemberProfileProps>)
) {
  protected constructor(props: MemberProfileProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateMemberProfileProps): MemberProfile {
    const now = new Date()
    return new MemberProfile({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: MemberProfileProps): MemberProfile {
    return new MemberProfile(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
  }

  get externalId(): string | null {
    return this._props.externalId
  }

  get fullName(): string {
    return this._props.fullName
  }

  get displayName(): string | null {
    return this._props.displayName
  }

  get dateOfBirth(): Date | null {
    return this._props.dateOfBirth
  }

  get gender(): Gender | null {
    return this._props.gender
  }

  get photoUrl(): string | null {
    return this._props.photoUrl
  }

  get locale(): string {
    return this._props.locale
  }

  get timezone(): string {
    return this._props.timezone
  }

  get language(): string {
    return this._props.language
  }

  get platformMembershipId(): string | null {
    return this._props.platformMembershipId
  }

  get tenantMembershipId(): string | null {
    return this._props.tenantMembershipId
  }

  // --------------- Behaviour Methods ---------------

  changeFullName(fullName: string): void {
    this.ensureActivated('MemberProfile')
    this._props.fullName = fullName
    this.touch()
  }

  changeDisplayName(displayName: string | null): void {
    this.ensureActivated('MemberProfile')
    this._props.displayName = displayName
    this.touch()
  }

  changeDateOfBirth(dateOfBirth: Date | null): void {
    this.ensureActivated('MemberProfile')
    this._props.dateOfBirth = dateOfBirth
    this.touch()
  }

  changeGender(gender: Gender | null): void {
    this.ensureActivated('MemberProfile')
    this._props.gender = gender
    this.touch()
  }

  changePhotoUrl(photoUrl: string | null): void {
    this.ensureActivated('MemberProfile')
    this._props.photoUrl = photoUrl
    this.touch()
  }

  changeLocale(locale: string): void {
    this.ensureActivated('MemberProfile')
    this._props.locale = locale
    this.touch()
  }

  changeTimezone(timezone: string): void {
    this.ensureActivated('MemberProfile')
    this._props.timezone = timezone
    this.touch()
  }

  changeLanguage(language: string): void {
    this.ensureActivated('MemberProfile')
    this._props.language = language
    this.touch()
  }

  changeExternalId(externalId: string | null): void {
    this.ensureActivated('MemberProfile')
    this._props.externalId = externalId
    this.touch()
  }

  assignPlatformMembership(platformMembershipId: string): void {
    this.ensureActivated('MemberProfile')
    if (this._props.tenantMembershipId) {
      throw new MemberProfileLockedError(this.id.value)
    }
    this._props.platformMembershipId = platformMembershipId
    this.touch()
  }

  assignTenantMembership(tenantMembershipId: string): void {
    this.ensureActivated('MemberProfile')
    if (this._props.platformMembershipId) {
      throw new MemberProfileLockedError(this.id.value)
    }
    this._props.tenantMembershipId = tenantMembershipId
    this.touch()
  }

  unassignMembership(): void {
    this.ensureActivated('MemberProfile')
    this._props.platformMembershipId = null
    this._props.tenantMembershipId = null
    this.touch()
  }
}
