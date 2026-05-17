import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import { SystemState, Lockable, type LockableProps } from '@shared/behaviours/lockable'
import { TenantRole } from '@users/user.types'

export type TenantMembershipProps = AuditableProps &
  LockableProps & {
    id: Id
    userId: string
    tenantId: string
    isOwner: boolean
    roles: TenantRole[]
  }

export type CreateTenantMembershipProps = Omit<
  TenantMembershipProps,
  keyof AuditableProps | keyof LockableProps | 'id'
>

export class TenantMembership extends Lockable(
  Auditable(Base<TenantMembershipProps>)
) {
  protected constructor(props: TenantMembershipProps) {
    super(props)
  }

  static create(props: CreateTenantMembershipProps): TenantMembership {
    const now = new Date()
    return new TenantMembership({
      ...props,
      id: Id.generate(),
      createdAt: now,
      updatedAt: now,
      systemState: SystemState.ACTIVE
    })
  }

  static rehydrate(props: TenantMembershipProps): TenantMembership {
    return new TenantMembership(props)
  }

  // Getters

  get id(): Id {
    return this._props.id
  }
  get userId(): string {
    return this._props.userId
  }

  get tenantId(): string {
    return this._props.tenantId
  }

  get isOwner(): boolean {
    return this._props.isOwner
  }

  get roles(): TenantRole[] {
    return [...this._props.roles]
  }

  // Behaviors
  addRole(role: TenantRole): void {
    this.ensureActivated('TenantMembership')
    if (!this._props.roles.includes(role)) {
      this._props.roles.push(role)
      this.touch()
    }
  }

  removeRole(role: TenantRole): void {
    this.ensureActivated('TenantMembership')
    this._props.roles = this._props.roles.filter((r) => r !== role)
    this.touch()
  }

  setAsOwner(): void {
    this.ensureActivated('TenantMembership')
    this._props.isOwner = true
    this.touch()
  }
}
