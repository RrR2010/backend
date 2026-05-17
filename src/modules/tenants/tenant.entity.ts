import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'
import { Json } from '@shared/types'

export type TenantProps = AuditableProps &
  LockableProps & {
    id: Id
    name: string
    slug: string | null
    website: string | null
    locale: string
    timezone: string
    language: string
    logoUrl: string | null
    settings: Json | null
  }

type CreateTenantProps = Omit<
  TenantProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class Tenant extends Lockable(Auditable(Base<TenantProps>)) {
  protected constructor(props: TenantProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateTenantProps): Tenant {
    const now = new Date()
    const tenant = new Tenant({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
    return tenant
  }

  static rehydrate(props: TenantProps): Tenant {
    return new Tenant(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
  }

  get name(): string {
    return this._props.name
  }

  get slug(): string | null {
    return this._props.slug
  }

  get website(): string | null {
    return this._props.website
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

  get logoUrl(): string | null {
    return this._props.logoUrl
  }

  get settings(): Json | null {
    return this._props.settings
  }

  // --------------- Behaviours ---------------

  changeName(newName: string): void {
    this.ensureActivated('Tenant')
    if (this._props.name === newName) return
    this._props.name = newName
    this.touch()
  }

  changeSlug(newSlug: string | null): void {
    this.ensureActivated('Tenant')
    if (this._props.slug === newSlug) return
    this._props.slug = newSlug
    this.touch()
  }

  changeWebsite(newWebsite: string | null): void {
    this.ensureActivated('Tenant')
    if (this._props.website === newWebsite) return
    this._props.website = newWebsite
    this.touch()
  }

  changeLocale(newLocale: string): void {
    this.ensureActivated('Tenant')
    if (this._props.locale === newLocale) return
    this._props.locale = newLocale
    this.touch()
  }

  changeTimezone(newTimezone: string): void {
    this.ensureActivated('Tenant')
    if (this._props.timezone === newTimezone) return
    this._props.timezone = newTimezone
    this.touch()
  }

  changeLanguage(newLanguage: string): void {
    this.ensureActivated('Tenant')
    if (this._props.language === newLanguage) return
    this._props.language = newLanguage
    this.touch()
  }

  changeLogoUrl(newLogoUrl: string | null): void {
    this.ensureActivated('Tenant')
    if (this._props.logoUrl === newLogoUrl) return
    this._props.logoUrl = newLogoUrl
    this.touch()
  }

  changeSettings(newSettings: Json): void {
    this.ensureActivated('Tenant')
    this._props.settings = newSettings
    this.touch()
  }

  activate(): void {
    super.activate()
  }

  lock(): void {
    super.lock()
  }

  delete(): void {
    super.delete()
  }
}
