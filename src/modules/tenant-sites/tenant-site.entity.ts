import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import {
  SystemState,
  Lockable,
  type LockableProps
} from '@shared/behaviours/lockable'
import { TenantSiteType } from '@shared/enums'

export type TenantSiteProps = AuditableProps &
  LockableProps & {
    id: Id
    tenantId: string
    name: string
    legalName: string
    externalId: string | null
    taxId: string
    siteType: TenantSiteType
    isHeadquarters: boolean
  }

export type CreateTenantSiteProps = Omit<
  TenantSiteProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class TenantSite extends Lockable(Auditable(Base<TenantSiteProps>)) {
  protected constructor(props: TenantSiteProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateTenantSiteProps): TenantSite {
    const now = new Date()

    return new TenantSite({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: TenantSiteProps): TenantSite {
    return new TenantSite(props)
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

  get legalName(): string {
    return this._props.legalName
  }

  get externalId(): string | null {
    return this._props.externalId
  }

  get taxId(): string {
    return this._props.taxId
  }

  get siteType(): TenantSiteType {
    return this._props.siteType
  }

  get isHeadquarters(): boolean {
    return this._props.isHeadquarters
  }

  // --------------- Behaviors ---------------

  changeName(name: string): void {
    this.ensureActivated('TenantSite')
    this._props.name = name
    this.touch()
  }

  changeLegalName(legalName: string): void {
    this.ensureActivated('TenantSite')
    this._props.legalName = legalName
    this.touch()
  }

  changeExternalId(externalId: string | null): void {
    this.ensureActivated('TenantSite')
    this._props.externalId = externalId
    this.touch()
  }

  changeTaxId(taxId: string): void {
    this.ensureActivated('TenantSite')
    this._props.taxId = taxId
    this.touch()
  }

  changeSiteType(siteType: TenantSiteType): void {
    this.ensureActivated('TenantSite')
    this._props.siteType = siteType
    this.touch()
  }

  setAsHeadquarters(): void {
    this.ensureActivated('TenantSite')
    this._props.isHeadquarters = true
    this.touch()
  }

  unsetAsHeadquarters(): void {
    this.ensureActivated('TenantSite')
    this._props.isHeadquarters = false
    this.touch()
  }
}
